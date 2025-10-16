import { BaseService } from '../../common/core/baseService'
import { ProductModel } from './productModel'
import { GetProductsParams, Product, SearchProductsParams } from './productInterface'
import { UploadService } from '../../modules/upload/uploadService'
import { AppError } from '../../common/utils/appError'

export class ProductService extends BaseService<Product> {
  private uploadService: UploadService
  constructor() {
    super(ProductModel.getInstance())
    this.uploadService = new UploadService()
  }

    // Common function to get populated item data
    private getPopulatedProduct = async (itemId: string): Promise<Product> => {
      const productModel = this.model.getMongooseModel();
      const item = await productModel.findById(itemId)
        .populate({
          path: 'image',
          select: 'url',
          model: 'Upload'
        })
        .populate({
          path: 'type',
          select: 'name',
          model: 'Category'
        })
        .lean();

      if (item.image) {
        item.image = item.image.url;
      }
      if (item.type) {
        item.type = item.type.name;
      }

      return item;
    }

    // Create product
    public createProduct = async (payload: Product): Promise<Product> => {
      const { image, ...rest } = payload

      const upload = await this.uploadService.create({
        file: image,
        userId: payload.createdBy,
      });
  
      const data = {
        ...rest,
        image: upload._id,
      }
      const item = await this.model.create(data)
      return this.getPopulatedProduct(item._id)
    }

    // Get products
    public getProducts = async (params: GetProductsParams): Promise<Product[]> => {
      
      let query:any = {}
      if(params.type){
        query.type = params.type
      }

      const products = await this.model.getAll(query)
      const populatedProducts = await Promise.all(products.map((product: any) => this.getPopulatedProduct(product._id)))
      return populatedProducts
    }

    // Update products
    public updateProduct = async (id: string, payload: Product): Promise<Product> => {
      const existingProduct = await this.model.getById(id);
      if (!existingProduct) {
        throw AppError.notFound('Product not found');
      }
  
      if (payload.image) {
        const upload = await this.uploadService.create({
          file: payload.image,
          userId: existingProduct.createdBy,
        });
  
        payload.image = upload._id;
        await this.uploadService.delete(existingProduct.image);
      }
  
      const updatedProduct = await this.model.update(id, payload);
      return this.getPopulatedProduct(updatedProduct._id);
    }

    // Delete products
    public deleteProduct = async (id: string): Promise<Product> => {
      const product = await this.model.delete(id)
      return this.getPopulatedProduct(product._id)
    }

    // Search products
    public searchProducts = async (params: SearchProductsParams): Promise<Product[]> => {
      
      let query:any = {}
      if(params.name){
        query.$or = [
          { name: { $regex: params.name, $options: 'i' } },
          { description: { $regex: params.name, $options: 'i' } },
        ]
      }

      const products = await this.model.getAll(query)
      const populatedProducts = await Promise.all(products.map((product: any) => this.getPopulatedProduct(product._id)))
      return populatedProducts
    }

}