import { Types } from 'mongoose'
import { QuoteModel } from './quoteModel'
import { OrderModel } from '../order/orderModel'
import { ProductModel } from '../product/productModel'
import { ProductTypeModel } from '../productType/productTypeModel'
import { ProductSubCategoryModel } from '../productSubCategory/productSubCategoryModel'
import { OptionGroupModel } from '../optionGroup/optionGroupModel'
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
import { EmailService } from '../../services/emailService'

export class InvoiceService {
  private quoteModel: QuoteModel
  private orderModel: OrderModel
  private productModel: ProductModel
  private appointmentModel: AppointmentModel
  private userModel: UserModel
  private uploadService: UploadService
  private emailService: EmailService

  private productTypeModel: ProductTypeModel
  private productSubCategoryModel: ProductSubCategoryModel
  private optionGroupModel: OptionGroupModel

  constructor() {
    this.quoteModel = QuoteModel.getInstance()
    this.orderModel = OrderModel.getInstance()
    this.productModel = ProductModel.getInstance()
    this.productTypeModel = ProductTypeModel.getInstance()
    this.productSubCategoryModel = ProductSubCategoryModel.getInstance()
    this.optionGroupModel = OptionGroupModel.getInstance()
    this.appointmentModel = AppointmentModel.getInstance()
    this.userModel = UserModel.getInstance()
    this.uploadService = new UploadService()
    this.emailService = new EmailService()
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
    const creator     = quote.creator || {}
    const appt        = quote.appointment || {}
    const ps          = quote.paymentStructure || {}
    const isV2        = Array.isArray(quote.line_items_v2) && quote.line_items_v2.length > 0

    // ── Company info ─────────────────────────────────────────────────────────
    const companyInfo = await this.getCompanyInfo()

    // ── Salesperson ──────────────────────────────────────────────────────────
    const salesperson = {
      name:         creator.name || '',
      cell:         creator.phoneNumber || '',
      email:        creator.email || '',
      quoteCreated: new Date(quote.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      quoteExpiry:  this.calculateExpiryDate(quote.createdAt),
      quoteNumber:  quote._id.toString().slice(-6).toUpperCase(),
    }

    // ── Customer / project / bill-to addresses ───────────────────────────────
    const custName    = appt.businessName || `${appt.firstName || ''} ${appt.lastName || ''}`.trim() || ''
    const custStreet  = appt.address1 || ''
    const custCityZip = [appt.city, appt.state, appt.zipCode].filter(Boolean).join(', ')

    const customer = {
      name:     custName,
      street:   custStreet,
      cityZip:  custCityZip,
      source:   appt.source || '',
      leadTime: appt.duration || '2–3 weeks',
    }

    // Project address (job site — same as customer if not separately set)
    const projStreet  = [appt.address1, appt.address2].filter(Boolean).join(' ') || custStreet
    const projCityZip = custCityZip
    const project = {
      name:    custName,
      street:  projStreet,
      cityZip: projCityZip,
    }

    // Bill To (billing address fields from appointment)
    const billName    = appt.billingContactName || custName
    const billStreet  = appt.billAddress?.street || appt.billAddress || custStreet
    const billCityZip = appt.billingCity
      ? [appt.billingCity, appt.state, appt.billingZip].filter(Boolean).join(', ')
      : custCityZip
    const billTo = {
      name:    billName,
      street:  billStreet,
      cityZip: billCityZip,
    }

    // ── Prefetch product types + option groups for V2 items ──────────────────
    const productTypeMap = new Map<string, any>()
    const subCategoryImageMap = new Map<string, string>() // sub_category_slug → image URL
    const optionGroupMap = new Map<string, string>() // slug → display_label

    if (isV2) {
      const ptIds = [...new Set(
        quote.line_items_v2
          .map((i: any) => i.product_type_id?.toString())
          .filter(Boolean)
      )]
      if (ptIds.length > 0) {
        const ptObjectIds = ptIds.map((id: any) => {
          try { return new Types.ObjectId(id) } catch { return null }
        }).filter(Boolean)
        const pts = await this.productTypeModel.getMongooseModel()
          ?.find({ _id: { $in: ptObjectIds } }, 'slug display_name sub_category_slug dimension_fields product_fields option_groups')
          .lean().exec() || []
        pts.forEach((pt: any) => productTypeMap.set(pt._id.toString(), pt))

        // Fetch sub-category images from unique sub_category_slug values
        const subCatSlugs = [...new Set(pts.map((pt: any) => pt.sub_category_slug).filter(Boolean))]
        if (subCatSlugs.length > 0) {
          const subCats = await this.productSubCategoryModel.getMongooseModel()
            ?.find({ slug: { $in: subCatSlugs } }, 'slug image')
            .lean().exec() || []
          subCats.forEach((sc: any) => {
            if (sc.image) subCategoryImageMap.set(sc.slug, sc.image)
          })
        }
      }

      // Collect all option group slugs referenced across all items
      const allOptionSlugs = new Set<string>()
      quote.line_items_v2.forEach((item: any) => {
        if (item.options_map) Object.keys(item.options_map).forEach((s: string) => allOptionSlugs.add(s))
      })
      if (allOptionSlugs.size > 0) {
        const ogs = await this.optionGroupModel.getMongooseModel()
          ?.find({ slug: { $in: [...allOptionSlugs] } }, 'slug display_label')
          .lean().exec() || []
        ogs.forEach((og: any) => optionGroupMap.set(og.slug, og.display_label || og.slug))
      }
    }

    // ── Line items ───────────────────────────────────────────────────────────
    let items: InvoiceData['items'] = []

    if (isV2) {
      items = quote.line_items_v2.map((item: any) => {
        const dims      = item.dimensions || {}
        const pt        = productTypeMap.get(item.product_type_id?.toString()) || {}

        // ── Build labeled fields from product type definitions ────────────
        // Merge dimension_fields + product_fields, sort by sort_order
        const fieldDefs: Record<string, { label: string; sort_order: number }> = {}
        const mergeDefs = (source: Record<string, any> | undefined) => {
          if (!source) return
          Object.entries(source).forEach(([key, def]: [string, any]) => {
            fieldDefs[key] = { label: def.label || key, sort_order: def.sort_order ?? 99 }
          })
        }
        mergeDefs(pt.dimension_fields)
        mergeDefs(pt.product_fields)

        // Build display value for each filled dimension key
        const buildValue = (key: string, raw: any): string => {
          if (raw === undefined || raw === null || raw === '') return ''

          // Combine ft/in pairs into readable string
          if (key === 'width_ft') {
            const parts = [raw !== '' ? `${raw}'` : '']
            if (dims.width_in && dims.width_in !== '0') parts.push(`${dims.width_in}"`)
            if (dims.width_fraction && dims.width_fraction !== '0') parts.push(dims.width_fraction)
            return parts.filter(Boolean).join(' ')
          }
          if (key === 'projection_ft') {
            const parts = [raw !== '' ? `${raw}'` : '']
            if (dims.projection_in && dims.projection_in !== '0') parts.push(`${dims.projection_in}"`)
            if (dims.projection_fraction && dims.projection_fraction !== '0') parts.push(dims.projection_fraction)
            return parts.filter(Boolean).join(' ')
          }
          if (key === 'height_ft') {
            const parts = [raw !== '' ? `${raw}'` : '']
            if (dims.height_in && dims.height_in !== '0') parts.push(`${dims.height_in}"`)
            return parts.filter(Boolean).join(' ')
          }
          // Skip sub-fields (in/fraction) — already merged above
          if (['width_in','width_fraction','projection_in','projection_fraction','height_in'].includes(key)) return ''

          return String(raw)
        }

        // Fabric always shown first if present
        const fabricValue = item.fabric
          ? `#${item.fabric.number}${item.fabric.name ? ' — ' + item.fabric.name : ''}`
          : ''


        const fields: Array<{ label: string; value: string, key: string }> = []


        // Add all filled dimension/product fields in sort order
        // const sortedKeys = Object.keys(dims).sort((a, b) => {
        //   const ao = fieldDefs[a]?.sort_order ?? 99
        //   const bo = fieldDefs[b]?.sort_order ?? 99
        //   return ao - bo
        // })

        // sortedKeys.forEach(key => {
        //   const val = buildValue(key, dims[key])
        //   if (!val) return
        //   const label = fieldDefs[key]?.label || key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
        //   fields.push({ label, value: val })
        // })

        // if (fabricValue) fields.push({ label: 'Fabric', value: fabricValue })

        // Preserve the natural key order from dimensions as stored on the item
        Object.keys(dims).forEach((key: string) => {
          const val = buildValue(key, dims[key])
          if (!val) return
          const label = fieldDefs[key]?.label || key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
          fields.push({ label, value: val, key })
        })


        // ── Build options from options_map ────────────────────────────────
        const options: Array<{ label: string; detail: string; yn: string; qty: string; price: string }> = []
        if (item.options_map) {
          Object.entries(item.options_map).forEach(([slug, sel]: [string, any]) => {
            const yn = sel.yn ?? ''
            if (!yn || yn === '') return
            const label = optionGroupMap.get(slug) || slug.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())

            // Build detail: sub_slug, brand, yn (if not "Yes"/"No"), then sub_fields
            const detailParts: string[] = []

            if (sel.sub_slug) {
              detailParts.push(sel.sub_slug.replace(/_/g, ' '))
            } else if (yn !== 'Yes' && yn !== 'No') {
              detailParts.push(yn)
            }

            if (sel.brand) {
              detailParts.push(String(sel.brand).charAt(0).toUpperCase() + String(sel.brand).slice(1))
            }

            // Include sub_fields (skip zero/empty values for qty_per_item style)
            if (sel.sub_fields && typeof sel.sub_fields === 'object') {
              Object.entries(sel.sub_fields).forEach(([sfKey, sfVal]: [string, any]) => {
                if (sfVal === undefined || sfVal === null || sfVal === '' || sfVal === 0) return
                // Skip notes-only fields when already captured in sub_slug
                const sfStr = String(sfVal).replace(/_/g, ' ')
                const sfLabel = sfKey.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
                detailParts.push(`${sfLabel}: ${sfStr}`)
              })
            }

            const detail = detailParts.join(' · ')
            const ynDisplay = yn === 'Yes' ? 'Yes' : yn || 'Yes'
            const qty    = sel.qty && sel.qty >= 1 ? `×${sel.qty}` : ''
            const price  = (sel.price ?? 0) > 0 ? this.formatCurrency(sel.price) : ''
            options.push({ label, detail, yn: ynDisplay, qty, price })
          })
        }

        const unitPrice   = item.unitPrice   ?? 0
        const optTotal    = item.optionsTotal ?? 0
        const installCost = item.installPrice ?? 0
        const subTotal    = item.line_total   ?? (unitPrice + optTotal + installCost)

        // Resolve sub-category image: pt.sub_category_slug → subCategoryImageMap
        const subCatSlug = pt.sub_category_slug || ''
        const rawImage   = subCatSlug ? (subCategoryImageMap.get(subCatSlug) || '') : ''
        const image      = rawImage ? this.optimizeImageUrl(rawImage, 400, 300, 70) : ''
        const sunbrellaLogo = this.optimizeImageUrl(`${config.app.url}/static/uploads/defaults/sunbrella.png`, 80, 40, 70)

        return {
          qty:          1,
          image,
          title:        item.product_name || '',
          fields,
          options,
          fabric:       item?.fabric || null,
          unitPrice:    this.formatCurrency(unitPrice),
          optionsTotal: optTotal    > 0 ? this.formatCurrency(optTotal)    : '',
          installPrice: installCost > 0 ? this.formatCurrency(installCost) : '',
          subTotal:     this.formatCurrency(subTotal),
          isNote:       false,
          noteText:     '',
          sunbrellaLogo
        }
      })
    } else {
      // ── Legacy V1 orders ─────────────────────────────────────────────────
      items = await Promise.all(
        quote.orders.map(async (order: any) => {
          const product = order.productData
          const fields: Array<{ label: string; value: string }> = []

          if (order.hardwareColor) fields.push({ label: 'Hardware Color', value: order.hardwareColor })
          if (order.width_ft)      fields.push({ label: 'Width',      value: `${order.width_ft}' ${order.width_in || 0}"` })
          if (order.projection_ft) fields.push({ label: 'Projection', value: `${order.projection_ft}' ${order.projection_in || 0}"` })
          if (order.height_ft)     fields.push({ label: 'Height',     value: `${order.height_ft}' ${order.height_in || 0}"` })
          if (order.fabricNumber)  fields.push({ label: 'Fabric',     value: `#${order.fabricNumber}` })
          if (order.installation)  fields.push({ label: 'Install',    value: order.installation })
          if (order.location?.address) fields.push({ label: 'Location', value: order.location.address })
          if (order.description)   fields.push({ label: 'Notes',     value: order.description })

          const options: Array<{ label: string; detail: string; yn: string; qty: string; price: string }> = []
          if (order.additionalFeatures) {
            Object.entries(order.additionalFeatures).forEach(([key, value]) => {
              if (!value || value === '0' || value === 'false' || value === 'No') return
              const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, (s: string) => s.toUpperCase())
              options.push({ label, detail: String(value), yn: 'Yes', qty: '', price: '' })
            })
          }

          const unitPrice = order.unitPrice || 0
          const qty       = order.quantity  || 1
          return {
            qty,
            image:        this.optimizeImageUrl(product?.image?.url || '', 400, 300, 70),
            title:        product?.name || '',
            fields,
            options,
            fabric:       null,
            unitPrice:    this.formatCurrency(unitPrice),
            optionsTotal: '',
            installPrice: '',
            subTotal:     this.formatCurrency(qty * unitPrice),
            isNote:       false,
            noteText:     '',
          }
        })
      )
    }

    // Special instructions note row
    if (isV2 && quote.quote_notes) {
      items.push({
        qty: 0, image: '', title: '', fields: [], options: [], fabric: null,
        unitPrice: '', optionsTotal: '', installPrice: '', subTotal: '',
        isNote: true, noteText: quote.quote_notes,
      })
    }

    // ── Summary ──────────────────────────────────────────────────────────────
    const msrp       = parseFloat(ps.msrp || '0')
    const discount   = parseFloat(ps.discount || '0')
    const grandTotal = ps.grandTotal || 0
    const hasTax     = ps.salesTax === 'Default'
    const taxAmt     = hasTax ? Math.max(0, grandTotal - (msrp - discount)) : 0

    const summary = {
      subtotal:  this.formatCurrency(msrp || (quote.paymentSummary?.subtotal || 0)),
      discount:  discount > 0 ? `−${this.formatCurrency(discount)}` : '0',
      taxes:     hasTax ? this.formatCurrency(taxAmt) : 'Included',
      grandTotal: this.formatCurrency(grandTotal || quote.paymentSummary?.total || 0),
      additionalInstallationCharges: parseFloat(ps.additionalInstallationCharges || '0') > 0 ? this.formatCurrency(parseFloat(ps.additionalInstallationCharges || '0')) : null,
    }

    // ── Payment schedule ─────────────────────────────────────────────────────
    const depositPct = parseFloat(ps.upfrontDeposit || '50')
    const deposit    = (depositPct / 100) * (grandTotal || 0)
    const balance    = (grandTotal || 0) - deposit

    const payment = {
      numberOfInstallments: ps.numberOfInstallments || '—',
      downPayment:          `${depositPct}% ( ${this.formatCurrency(deposit)} )`,
      balanceDue:           this.formatCurrency(balance),
      paymentMethod:        quote.paymentDetails?.paymentMethod || '—',
    }

    // ── Office-only section ───────────────────────────────────────────────────
    const officeOnly = {
      customerName:  custName,
      salesPerson:   creator.name || '',
      saleDate:      new Date(quote.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      depositReceived: this.formatCurrency(deposit),
      depositSource:   quote.paymentDetails?.paymentMethod || '—',
      leadTime:        appt.duration || '—',
      hiddenMarkup:    parseFloat(ps.hiddenMarkup || '0') > 0 ? this.formatCurrency(parseFloat(ps.hiddenMarkup)) : '—',
    }

    const signatureData = {
      sign: quote.paymentDetails?.signature ? this.optimizeImageUrl(quote.paymentDetails.signature, 200, 100, 70) : '',
      date: quote.paymentDetails?.signature_timestamp
    }
    // const signature = quote.paymentDetails?.signature ? this.optimizeImageUrl(quote.paymentDetails.signature, 200, 100, 70) : ''
    // const signDate = quote.paymentDetails?.signature_timestamp;


    const terms = [
      'THE UNPAID BALANCE IS DUE TO THE INSTALLERS UPON COMPLETION OF THE INSTALLATION. Unpaid balances will bear interest at the rate of .2% per month. The goods sold herein remain the property of the Seller until full payment is received. Product specifications are subject to change without notice.',
      'If any legal action is commenced to enforce the terms of this contract the prevailing party shall be entitled to reasonable attorney fees, collection costs and court costs.',
      'Statutory Right of Rescission. Buyer may cancel this transaction at any time prior to midnight on the third business day. Cancellation must be in writing, mail, email or fax. After this period the order will be processed and the TOTAL contract is payable to the seller.',
      'BUYER is responsible for general care and maintenance of all products. SELLER is not responsible for storm, wind or rain damage or from other conditions over which it has no control. All Valances and Bindings carry a 1 year warranty.',
      'SELLER IS NOT responsible for any permits required. This is the sole responsibility of the BUYER.',
      'Company installers do not carry paint but will do "touch up" stucco or wood (first coat only), provided BUYER supplies necessary materials during the installation.',
    ]

    return { company: companyInfo, salesperson, customer, project, billTo, items, summary, payment, officeOnly, terms, signatureData }
  }

  // Optimize image URL using Cloudinary transformations
  private optimizeImageUrl(url: string, width: number, height: number, quality: number = 70): string {
    if (!url || !url.includes('cloudinary.com')) {
      return url
    }

    // Insert transformation parameters into Cloudinary URL
    const transformation = `w_${width},h_${height},c_fill,q_${quality},f_jpg`
    return url.replace('/upload/', `/upload/${transformation}/`)
  }

  // Get company info
  private async getCompanyInfo() {
    return {
      logo:    this.optimizeImageUrl(`${config.app.url}/static/uploads/companylogo.png`, 120, 120, 70),
      address: '16811 HALE AVE. STE-E IRVINE CA 92606',
      email:   'larry@theawningcompanyca.com',
      office:  '949.325.5627',
      website: 'www.theawningcompanyca.com',
      license: '968011',
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
        // .slice(0, 5) // Limit to 5 sponsors max to reduce PDF size
        .map(file => this.optimizeImageUrl(`${config.app.url}/static/sponsers/${file}`, 150, 80, 60))
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

    // Generate PDF buffer with optimized settings for smaller file size
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: true,
      scale: 0.9, // Slightly reduce scale to decrease file size
      displayHeaderFooter: false,
      margin: { top: '10mm', bottom: '10mm', left: '10mm', right: '10mm' },
    })

    await browser.close()

    // Validate file size before upload (10MB limit for Cloudinary free tier)
    const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB in bytes
    const fileSizeMB = (pdfBuffer.length / 1024 / 1024).toFixed(2)

    if (pdfBuffer.length > MAX_FILE_SIZE) {
      throw new Error(
        `Invoice PDF file size (${fileSizeMB}MB) exceeds the maximum allowed size of 10MB. ` +
        `Please reduce the number of items in the quote or contact support for assistance.`
      )
    }

    // Convert buffer to stream properly
    const pdfStream = new Readable({
      read() {
        // Empty read function
      },
    })

    pdfStream.push(pdfBuffer)
    pdfStream.push(null)

    const fileName = `invoice-${Date.now()}.pdf`

    // Save file in db with proper error handling
    let file
    try {
      file = await this.uploadService.create({
        file: {
          originalname: fileName,
          buffer: pdfStream,
          mimetype: 'application/pdf',
          size: pdfBuffer.length,
        },
      })
    } catch (uploadError: any) {
      console.error('Failed to upload invoice PDF:', uploadError)

      // Re-throw with user-friendly message
      if (uploadError.message && uploadError.message.includes('File size too large')) {
        throw new Error(
          `Invoice PDF file size (${fileSizeMB}MB) exceeds upload limit. ` +
          `Please contact support for assistance.`
        )
      }

      throw new Error(`Failed to save invoice PDF: ${uploadError.message}`)
    }

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

    // save file id in quote (background-task with error handling)
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
        // Error is caught and logged, won't crash the server
      }
    })

    return response
  }

  // Email invoice PDF to client
  public async emailInvoiceToClient(quoteId: string): Promise<void> {
    const quote = await this.quoteModel.getMongooseModel()
      ?.findById(quoteId)
      .populate('appointmentId', 'emailAddress firstName lastName businessName customerType')
      .lean()
      .exec()

    if (!quote) throw new Error('Quote not found')
    if (!quote.invoice) throw new Error('No invoice found for this quote. Please generate invoice first.')

    const file = await this.uploadService.getById(quote.invoice)
    if (!file?.url) throw new Error('Invoice file not found. Please regenerate the invoice.')

    const appt: any = quote.appointmentId || {}
    const customerEmail = appt.emailAddress
    if (!customerEmail) throw new Error('No email address found for this client.')

    const customerName =
      appt.customerType === 'residential' || appt.customerType === 'designer'
        ? `${appt.firstName || ''} ${appt.lastName || ''}`.trim()
        : appt.businessName || 'Valued Customer'

    const quoteNumber = (quote as any)._id.toString().slice(-6).toUpperCase()

    await this.emailService.sendInvoiceToClient(customerEmail, customerName, file.url, quoteNumber)
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
