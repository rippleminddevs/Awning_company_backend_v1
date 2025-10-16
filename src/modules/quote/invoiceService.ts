import { Types } from 'mongoose';
import { QuoteModel } from './quoteModel';
import { OrderModel } from '../order/orderModel';
import { ProductModel } from '../product/productModel';
import { AppointmentModel } from '../appointment/appointmentModel';
import { UserModel } from '../user/userModel';
import { InvoiceData } from './quoteInterface';
import puppeteer from "puppeteer";
import ejs from "ejs";
import path from "path";
import { UploadService } from '../upload/uploadService';
import { Readable } from 'stream';
import { config } from '../../services/configService';

export class InvoiceService {
  private quoteModel: QuoteModel;
  private orderModel: OrderModel;
  private productModel: ProductModel;
  private appointmentModel: AppointmentModel;
  private userModel: UserModel;
  private uploadService: UploadService;

  constructor() {
    this.quoteModel = QuoteModel.getInstance();
    this.orderModel = OrderModel.getInstance();
    this.productModel = ProductModel.getInstance();
    this.appointmentModel = AppointmentModel.getInstance();
    this.userModel = UserModel.getInstance();
    this.uploadService = new UploadService();
  }

  // Generate invoice data
  public async generateInvoiceData(quoteId: string): Promise<InvoiceData> {
    const quote = await this.getQuoteWithRelations(quoteId);
    return this.transformToInvoiceData(quote);
  }

  // Get quote with aggregation
  private async getQuoteWithRelations(quoteId: string) {
    const quote = await this.quoteModel.getMongooseModel()?.aggregate([
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
    ]).exec();
  
    if (!quote || quote.length === 0) {
      throw new Error('Quote not found');
    }
  
    const productIds = [...new Set(quote[0].orders.map((order: any) => 
      order.product ? order.product.toString() : null
    )).values()].filter(Boolean);
    const awningTypeIds = [...new Set(quote[0].orders.map((order: any) => 
      order.awningType ? order.awningType.toString() : null
    )).values()].filter(Boolean);
    const [products, awningTypes] = await Promise.all([
      this.productModel.getMongooseModel()?.find(
        { _id: { $in: productIds } },
        'name description images'
      ).populate({
        path: 'image',
        select: 'url',
        model: 'Upload'
      })
      
      .lean().exec() || [],
      this.productModel.getMongooseModel()?.find(
        { _id: { $in: awningTypeIds } },
        'name description'
      ).lean().exec() || []
    ]);

    const productMap = new Map(products.map((p: any) => [p._id.toString(), p]));
    const awningTypeMap = new Map(awningTypes.map((at: any) => [at._id.toString(), at]));
    const enrichedQuote = {
      ...quote[0],
      orders: quote[0].orders.map((order: any) => ({
        ...order,
        productData: order.product ? productMap.get(order.product.toString()) : null,
        awningTypeData: order.awningType ? awningTypeMap.get(order.awningType.toString()) : null
      }))
    };

    return enrichedQuote;
  }

  // Transform quote to invoice data
  private async transformToInvoiceData(quote: any): Promise<InvoiceData> {
    // Get company info 
    const companyInfo = await this.getCompanyInfo(quote.creator.name);

    // Get salesperson info
    const salesperson = {
      name: `${quote.creator.name}`,
      phone: quote.creator.phoneNumber || '',
      email: quote.creator.email,
      quoteCreated: quote.createdAt.toLocaleDateString(),
      quoteExpiry: this.calculateExpiryDate(quote.createdAt),
    };

    // Transform order items
    const items = await Promise.all(
      quote.orders.map(async (order: any) => {
        const product = order.productData;

        const features: string[] = [];
        if (order.additionalFeatures) {
          Object.entries(order.additionalFeatures).forEach(([key, value]) => {
            if (
              value && 
              value !== '0' && 
              value !== 'false' && 
              value !== 'No' 
            ) {
              const label = key
                .replace(/([A-Z])/g, ' $1')  
                .replace(/^./, str => str.toUpperCase()); 
              features.push(`${label}: ${value}`);
            }
          });
        }
        

        return {
          qty: order.quantity || 1,
          unitPrice: this.formatCurrency(order.unitPrice),
          extendedPrice: this.formatCurrency(quote.paymentStructure?.grandTotal),
          image: product?.image?.url || '',
          title: product?.name || '',
          description: product?.description || '',
          location: quote.appointment.address1 + ' ' + quote.appointment.address2,
          options: features, 
          size: `Width: ${order.width_ft}' ${order.width_in || 0}" ${order.widthFraction || '0'}/8"
    Height: ${order.height_ft}' ${order.height_in || 0}" ${order.heightFraction || '0'}/8"
    Projection: ${order.projection_ft}' ${order.projection_in || 0}" ${order.projectionFraction || '0'}/8"`,
          color: order.hardwareColor,
          notes: order.notes
        };
      })
    );

    // Calculate summary
    const subtotal = quote.orders.reduce((sum: number, order: any) => 
      sum + (order.quantity * order.unitPrice), 0);
    
    const summary = {
      subtotal: this.formatCurrency(quote.paymentSummary?.subtotal || 0),
      discount: this.formatCurrency(quote.paymentSummary?.discount || 0),
      taxes: 'Included',
      freight: 'Included',
      total: this.formatCurrency(quote.paymentSummary?.total || 0),
    };

    // Payment schedule
    const payment = {
      dueAcceptance: this.formatCurrency(quote.paymentSummary?.dueAcceptance || 0),
      installments: quote.paymentStructure?.numberOfInstallments || '1',
      duePriorDelivery: this.formatCurrency(quote.paymentSummary?.duePriorDelivery || 0),
      balanceCompletion: this.formatCurrency(
        quote.paymentSummary?.balanceCompletion || 0
      ),
    };

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
    };

    // Terms and conditions
    const terms = [
      'All sales are final. No returns or exchanges unless otherwise specified.',
      'A 50% deposit is required to begin work.',
      'Balance is due upon completion of work.',
      'Additional charges may apply for changes requested after work has begun.',
      'We are not responsible for any pre-existing conditions or damages discovered during installation.',
    ];

    return {
      company: companyInfo,
      salesperson,
      customer,
      items,
      summary,
      payment,
      terms,
    };
  }

  // Get company info
  private async getCompanyInfo(salespersonName: string) {
    return {
      logo: `${config.app.url}/static/uploads/companylogo.png`,
      address: '123 Business St, City, State ZIP',
      email: 'info@company.com',
      office: '(555) 123-4567',
      license: 'ABC123456',
      representative: salespersonName,
      direct: '(555) 987-6543',
      sponsers:[
        `${config.app.url}/static/sponsers/sponser10.jpg`,
        `${config.app.url}/static/sponsers/sponser9.png`,
        `${config.app.url}/static/sponsers/sponser8.png`,
        `${config.app.url}/static/sponsers/sponser7.png`,
        `${config.app.url}/static/sponsers/sponser6.png`,
        `${config.app.url}/static/sponsers/sponser5.png`,
        `${config.app.url}/static/sponsers/sponser4.jpg`,
        `${config.app.url}/static/sponsers/sponser3.jpg`,
        `${config.app.url}/static/sponsers/sponser2.jpg`,
        `${config.app.url}/static/sponsers/sponser1.png`,
      ]
    };
  }

  // Calculate expiry date
  private calculateExpiryDate(createdAt: Date): string {
    const expiry = new Date(createdAt);
    expiry.setDate(expiry.getDate() + 30); // 30 days expiry
    return expiry.toLocaleDateString();
  }

  // Format currency
  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  }

  // Download invoice
  public async generatePdf(data: InvoiceData, quoteId: string): Promise<any> {
    // Render invoice1.ejs
    const invoice1Html = await ejs.renderFile(
      path.join(process.cwd(), "src/views/invoice/invoice1.ejs"),
      data
    );

    // Render invoice2.ejs
    const invoice2Html = await ejs.renderFile(
      path.join(process.cwd(), "src/views/invoice/invoice2.ejs"),
      data
    );

    // Combine into one HTML string
    const combinedHtml = `
      <html>
        <head>
          <meta charset="utf-8"/>
          <style>
            body { margin: 0; padding: 0; }
            .page-break { page-break-before: always; }
          </style>
        </head>
        <body>
          ${invoice1Html}
          <div class="page-break"></div>
          ${invoice2Html}
        </body>
      </html>
    `;

    // Launch Puppeteer
    const isLinux = process.platform === "linux";

    const browser = await puppeteer.launch({
      headless: true,
      executablePath: isLinux
        ? "/opt/render/.cache/puppeteer/chrome/linux-140.0.7339.80/chrome-linux64/chrome"
        : undefined,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.setContent(combinedHtml, { waitUntil: "networkidle0" });

    // Generate PDF buffer
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true
    });

    await browser.close();

    // Convert buffer to stream
    const pdfStream = new Readable();
    pdfStream.push(pdfBuffer);
    pdfStream.push(null);

    const fileName = `invoice-${Date.now()}.pdf`;
    
    // Save file in db
    const file = await this.uploadService.create({
      file: {
        originalname: fileName,
        buffer: pdfStream,
        mimetype: 'application/pdf',
        size: pdfBuffer.length
      },
    });

    // Set headers for download
    const response:any = {
      url: file.url,
      fileName: file.originalName,
      size: file.size,
      mimeType: file.mimeType,
    }
    
    // save file id in quote (background-task)
    setImmediate(async () => {

      const quote = await this.quoteModel.getMongooseModel()
          ?.findById({_id:quoteId});
    
      if (quote) {
        const existingFile = await this.uploadService.getById(quote.invoice!);
        if (existingFile) {
          await this.uploadService.delete(existingFile._id);
        }
        await this.quoteModel.getMongooseModel()
          ?.updateOne({ _id: quoteId }, { invoice: file._id });
      }

    });

    return response;
  }
}