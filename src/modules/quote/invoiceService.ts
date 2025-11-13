import { Types } from 'mongoose'
import { QuoteModel } from './quoteModel'
import { OrderModel } from '../order/orderModel'
import { ProductModel } from '../product/productModel'
import { AppointmentModel } from '../appointment/appointmentModel'
import { UserModel } from '../user/userModel'
import { InvoiceData, InvoiceResponse } from './quoteInterface'
import puppeteer from 'puppeteer'
import ejs from 'ejs'
import path from 'path'
import { UploadService } from '../upload/uploadService'
import { Readable } from 'stream'
import { config } from '../../services/configService'
import * as fs from 'fs'

export class InvoiceService {
  private quoteModel: QuoteModel
  private orderModel: OrderModel
  private productModel: ProductModel
  private appointmentModel: AppointmentModel
  private userModel: UserModel
  private uploadService: UploadService

  constructor() {
    this.quoteModel = QuoteModel.getInstance()
    this.orderModel = OrderModel.getInstance()
    this.productModel = ProductModel.getInstance()
    this.appointmentModel = AppointmentModel.getInstance()
    this.userModel = UserModel.getInstance()
    this.uploadService = new UploadService()
  }

  // Generate invoice data
  public async generateInvoiceData(quoteId: string): Promise<InvoiceData> {
    const quote = await this.getQuoteWithRelations(quoteId)
    return this.transformToInvoiceData(quote)
  }

  // Get quote with aggregation
  private async getQuoteWithRelations(quoteId: string) {
    const quote = await this.quoteModel
      .getMongooseModel()
      ?.aggregate([
        { $match: { _id: new Types.ObjectId(quoteId) } },
        {
          $lookup: {
            from: 'appointments',
            localField: 'appointmentId',
            foreignField: '_id',
            as: 'appointment',
          },
        },
        { $unwind: '$appointment' },
        {
          $lookup: {
            from: 'orders',
            localField: '_id',
            foreignField: 'quoteId',
            as: 'orders',
          },
        },
        {
          $lookup: {
            from: 'users',
            localField: 'createdBy',
            foreignField: '_id',
            as: 'creator',
          },
        },
        { $unwind: '$creator' },
      ])
      .exec()

    if (!quote || quote.length === 0) {
      throw new Error('Quote not found')
    }

    const productIds = [
      ...new Set(
        quote[0].orders.map((order: any) => (order.product ? order.product.toString() : null))
      ).values(),
    ].filter(Boolean)
    const awningTypeIds = [
      ...new Set(
        quote[0].orders.map((order: any) => (order.awningType ? order.awningType.toString() : null))
      ).values(),
    ].filter(Boolean)
    const [products, awningTypes] = await Promise.all([
      this.productModel
        .getMongooseModel()
        ?.find({ _id: { $in: productIds } }, 'name description images')
        .populate({
          path: 'image',
          select: 'url',
          model: 'Upload',
        })
        .lean()
        .exec() || [],
      this.productModel
        .getMongooseModel()
        ?.find({ _id: { $in: awningTypeIds } }, 'name description')
        .lean()
        .exec() || [],
    ])

    const productMap = new Map(products.map((p: any) => [p._id.toString(), p]))
    const awningTypeMap = new Map(awningTypes.map((at: any) => [at._id.toString(), at]))
    const enrichedQuote = {
      ...quote[0],
      orders: quote[0].orders.map((order: any) => ({
        ...order,
        productData: order.product ? productMap.get(order.product.toString()) : null,
        awningTypeData: order.awningType ? awningTypeMap.get(order.awningType.toString()) : null,
      })),
    }

    return enrichedQuote
  }

  // Transform quote to invoice data
  private async transformToInvoiceData(quote: any): Promise<InvoiceData> {
    // Get company info
    const companyInfo = await this.getCompanyInfo(quote.creator.name)

    // Get salesperson info
    const salesperson = {
      name: `${quote.creator.name}`,
      phone: quote.creator.phoneNumber || '',
      email: quote.creator.email,
      quoteCreated: quote.createdAt.toLocaleDateString(),
      quoteExpiry: this.calculateExpiryDate(quote.createdAt),
    }

    // Transform order items
    const items = await Promise.all(
      quote.orders.map(async (order: any) => {
        const product = order.productData

        const features: string[] = []
        if (order.additionalFeatures) {
          Object.entries(order.additionalFeatures).forEach(([key, value]) => {
            if (value && value !== '0' && value !== 'false' && value !== 'No') {
              const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
              features.push(`${label}: ${value}`)
            }
          })
        }

        return {
          qty: order.quantity || 1,
          unitPrice: this.formatCurrency(order.unitPrice),
          extendedPrice: this.formatCurrency((order.quantity || 1) * order.unitPrice),
          image: product?.image?.url || '',
          title: product?.name || '',
          description: product?.description || '',
          location: quote.appointment.address1 + ' ' + quote.appointment.address2,
          options: features,
          size: `Width: ${order.width_ft}' ${order.width_in || 0}" ${order.widthFraction || '0'}/8"
    Height: ${order.height_ft}' ${order.height_in || 0}" ${order.heightFraction || '0'}/8"
    Projection: ${order.projection_ft}' ${order.projection_in || 0}" ${order.projectionFraction || '0'}/8"`,
          color: order.hardwareColor,
          notes: order.notes,
        }
      })
    )

    // Calculate summary
    const subtotal = quote.orders.reduce(
      (sum: number, order: any) => sum + order.quantity * order.unitPrice,
      0
    )

    const summary = {
      subtotal: this.formatCurrency(quote.paymentSummary?.subtotal || 0),
      discount: this.formatCurrency(quote.paymentSummary?.discount || 0),
      taxes: 'Included',
      freight: 'Included',
      total: this.formatCurrency(quote.paymentSummary?.total || 0),
    }

    // Payment schedule
    const payment = {
      dueAcceptance: this.formatCurrency(quote.paymentSummary?.dueAcceptance || 0),
      installments: quote.paymentStructure?.numberOfInstallments || '1',
      duePriorDelivery: this.formatCurrency(quote.paymentSummary?.duePriorDelivery || 0),
      balanceCompletion: this.formatCurrency(quote.paymentSummary?.balanceCompletion || 0),
    }

    // Customer info
    const customer = {
      quoteId: quote._id.toString().slice(-6),
      name: `${quote.appointment.firstName} ${quote.appointment.lastName}`,
      phone: quote.appointment.bestContact || '',
      email: quote.appointment.emailAddress || '',
      street: quote.appointment.address1 || '',
      city: quote.appointment.city || '',
      state: quote.appointment.state || '',
      zipCode: quote.appointment.zipCode || '',
      jobLocation: quote.appointment.address1 + quote.appointment.address2 || '',
      leadTime: quote.appointment.time.toLocaleString() || '2-3 weeks',
      installTime: quote.appointment.duration || '1-2 days',
      source: 'TAC Web',
    }

    // Terms and conditions
    const terms = [
      'THE UNPAID BALANCE IS DUE TO THE INSTALLERS UPON COMPLETION OF THE INSTALLATION. Unpaid balances will bear interest at the rate of .2% per month. The goods sold herein remain the property of the Seller until full payment is received. Product specifications are subject to change without notice.',
      'If any legal action is commenced to enforce the terms of this contract the prevailing party shall be entitled to reasonable attorney fees, collection costs and court costs.',
      '3. Statutory Right of Rescission. Buyer may cancel this transaction at any time prior to midnight on the third business day. Cancellation must be in writing, mail, email or fax. After this period the order will be processed and the TOTAL contract is payable to the seller.',
      'BUYER is responsible for general care and maintenance of all products. SELLER is not responsible for storm, wind or rain damage or from other conditions over which it has no control. All Valances and Bindings carry a 1 year warranty.',
      'SELLER IS NOT responsible for any permits required. This is the sole responsibility of the BUYER.',
      'Company installers do not carry paint but will do "touch up" stucco or wood (first coat only), provided BUYER supplies necessary materials during the installation.',
    ]

    return {
      company: companyInfo,
      salesperson,
      customer,
      items,
      summary,
      payment,
      terms,
    }
  }

  // Get company info
  private async getCompanyInfo(salespersonName: string) {
    return {
      logo: `${config.app.url}/static/uploads/companylogo.png`,
      address: '16811 HALE AVE. STE-E IRVINE CA 92606',
      email: 'larry@theawningcompanyca.com',
      office: '949.325.5627',
      license: '968011',
      representative: 'Larry Martinez',
      direct: '949.280.7805',
      sponsers: await this.getSponsorLogos(),
    }
  }

  // Get sponsor logos from static directory
  private async getSponsorLogos(): Promise<string[]> {
    try {
      const sponsersDir = path.join(process.cwd(), 'static/sponsers')
      const files = fs.readdirSync(sponsersDir)
      return files
        .filter(file => /\.(jpg|jpeg|png)$/i.test(file))
        .sort()
        .map(file => `${config.app.url}/static/sponsers/${file}`)
    } catch (error) {
      console.error('Error reading sponsor directory:', error)
      return []
    }
  }

  // Calculate expiry date
  private calculateExpiryDate(createdAt: Date): string {
    const expiry = new Date(createdAt)
    expiry.setDate(expiry.getDate() + 30) // 30 days expiry
    return expiry.toLocaleDateString()
  }

  // Format currency
  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  // Public method to generate PDF with data
  public async generatePdfWithData(quoteId: string): Promise<InvoiceResponse> {
    // Get invoice data
    const invoiceData = await this.generateInvoiceData(quoteId)

    // Generate PDF
    const response = await this.generatePdf(invoiceData, quoteId)

    return response
  }

  // Get existing invoice without regeneration
  public async getExistingInvoice(quoteId: string): Promise<InvoiceResponse> {
    // Get quote with invoice reference
    const quote = await this.quoteModel.getMongooseModel()?.findById(quoteId)

    if (!quote) {
      throw new Error('Quote not found')
    }

    if (!quote.invoice) {
      throw new Error('No invoice found for this quote. Please generate invoice first.')
    }

    // Get existing file from upload service
    const file = await this.uploadService.getById(quote.invoice)

    if (!file) {
      throw new Error('Invoice file not found. Please regenerate invoice.')
    }

    // Format file size for human readability
    const humanReadableSize = this.formatFileSize(file.size || 0)

    return {
      url: file.url || '',
      fileName: file.originalName || '',
      size: file.size || 0,
      sizeHuman: humanReadableSize,
      mimeType: file.mimeType || 'application/pdf',
      fileId: file._id || '',
    }
  }

  // Download invoice
  public async generatePdf(data: InvoiceData, quoteId: string): Promise<InvoiceResponse> {
    // Render new invoice template with config
    const invoiceHtml = await ejs.renderFile(
      path.join(process.cwd(), 'src/views/invoice/newInvoice.ejs'),
      { ...data, config }
    )

    // Wrap HTML for PDF generation with proper viewport
    const combinedHtml = invoiceHtml;
    // `
    //   <!DOCTYPE html>
    //   <html>
    //     <head>
    //       <meta charset="utf-8"/>
    //       <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    //       <style>
    //         body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
    //       </style>
    //     </head>
    //     <body>
    //       ${invoiceHtml}
    //     </body>
    //   </html>
    // `

    // Launch Puppeteer
    const isLinux = process.platform === 'linux'

    // Puppeteer configuration for different environments
    let puppeteerOptions: any = {
      headless: true,
      // Use environment variables for Chrome path
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-web-security',
        '--disable-extensions',
        '--no-first-run',
        '--no-default-browser-check',
        '--disable-background-timer-throttling',
        '--disable-renderer-backgrounding',
      ],
    }

    // Only try to find Chrome if not already set via environment
    if (isLinux && !process.env.PUPPETEER_EXECUTABLE_PATH) {
      // Try to find Chrome in common locations
      const possiblePaths = [
        '/opt/render/.cache/puppeteer/chrome/linux-140.0.7339.80/chrome-linux64/chrome',
        '/opt/render/.cache/puppeteer/chrome/linux-139.0.7354.142/chrome-linux64/chrome',
        '/opt/render/.cache/puppeteer/chrome/linux-138.0.7375.236/chrome-linux64/chrome',
        '/usr/bin/google-chrome',
        '/usr/bin/chromium-browser',
        '/usr/bin/chromium',
      ]

      for (const chromePath of possiblePaths) {
        try {
          if (require('fs').existsSync(chromePath)) {
            puppeteerOptions.executablePath = chromePath
            console.log('Using Chrome at:', chromePath)
            break
          }
        } catch (error) {
          continue
        }
      }

      // If no Chrome found, let Puppeteer try auto-detection
      if (!puppeteerOptions.executablePath) {
        console.log('Chrome not found, using Puppeteer auto-detection')
      }
    }

    let browser
    try {
      browser = await puppeteer.launch(puppeteerOptions)
      console.log('Puppeteer launched successfully')
    } catch (launchError) {
      console.error('Puppeteer launch error:', launchError)

      // Fallback: Try with minimal options
      const fallbackOptions = {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      }

      try {
        browser = await puppeteer.launch(fallbackOptions)
        console.log('Puppeteer launched with fallback options')
      } catch (fallbackError) {
        console.error('Fallback launch also failed:', fallbackError)
        console.log('Environment info:', {
          platform: process.platform,
          nodeVersion: process.version,
          puppeteerVersion: require('puppeteer/package.json').version,
        })
        throw new Error(`Failed to launch Puppeteer: ${(fallbackError as Error).message}`)
      }
    }

    const page = await browser.newPage()

    // Set viewport for consistent PDF generation
    await page.setViewport({ width: 1200, height: 800 })

    // Wait for content to load properly
    await page.setContent(combinedHtml, {
      waitUntil: ['networkidle0', 'domcontentloaded'],
      timeout: 30000,
    })

    // Add a small delay to ensure all styles are applied
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Generate PDF buffer with better settings
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: true,
      scale: 1.0,
      displayHeaderFooter: false,
    })

    await browser.close()

    // Convert buffer to stream properly
    const pdfStream = new Readable({
      read() {
        // Empty read function
      },
    })

    pdfStream.push(pdfBuffer)
    pdfStream.push(null)

    const fileName = `invoice-${Date.now()}.pdf`

    // Save file in db
    const file = await this.uploadService.create({
      file: {
        originalname: fileName,
        buffer: pdfStream,
        mimetype: 'application/pdf',
        size: pdfBuffer.length,
      },
    })

    // Format file size for human readability
    const humanReadableSize = this.formatFileSize(pdfBuffer.length)

    // Set headers for download
    const response: InvoiceResponse = {
      url: file.url || '',
      fileName: file.originalName || '',
      size: file.size || 0,
      sizeHuman: humanReadableSize,
      mimeType: file.mimeType || 'application/pdf',
      fileId: file._id || '',
    }

    // save file id in quote (background-task)
    setImmediate(async () => {
      try {
        const quote = await this.quoteModel.getMongooseModel()?.findById({ _id: quoteId })

        if (quote) {
          const existingFile = await this.uploadService.getById(quote.invoice!)
          if (existingFile) {
            await this.uploadService.delete(existingFile._id)
          }
          await this.quoteModel
            .getMongooseModel()
            ?.updateOne({ _id: quoteId }, { invoice: file._id })
          console.log(`Invoice file ${file._id} saved to quote ${quoteId}`)
        }
      } catch (error) {
        console.error('Error saving invoice file to quote:', error)
      }
    })

    return response
  }

  // Format file size to human readable format
  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'

    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }
}
