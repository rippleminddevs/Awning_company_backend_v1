import { FieldsConfig } from '../../common/interfaces/fieldTypes';
import { BaseModel } from '../../common/core/baseModel';
import { IContent } from './contentInterface';

const fields: FieldsConfig = {
  type: {
    type: 'string',
    nullable: false,
    enum: ['about', 'privacy', 'terms', 'faq'],
  },
  title: {
    type: 'string',
    nullable: true,
  },
  content: {
    type: 'string',
    nullable: true,
  },
  question: {
    type: 'string',
    nullable: true,
  },
  answer: {
    type: 'string',
    nullable: true,
  },
  order: {
    type: 'number',
    nullable: false,
  },
};

export class ContentModelClass extends BaseModel<IContent> {
  private static instance: ContentModelClass;

  constructor() {
    super('Content', fields);
  }

  public static getInstance(): ContentModelClass {
    if (!ContentModelClass.instance) {
      ContentModelClass.instance = new ContentModelClass();
    }
    return ContentModelClass.instance;
  }

  // Get content by type (for about, privacy, terms)
  public getByType = async (type: string): Promise<IContent | null> => {
    const mongooseModel = this.getMongooseModel();
    if (!mongooseModel) return null;
    return await mongooseModel.findOne({ type }).lean();
  };

  // Get all FAQs
  public getFAQs = async (): Promise<IContent[]> => {
    const mongooseModel = this.getMongooseModel();
    if (!mongooseModel) return [];
    return await mongooseModel.find({ type: 'faq' }).sort({ order: 1, createdAt: 1 }).lean();
  };

  // Get single FAQ by ID
  public getFAQById = async (id: string): Promise<IContent | null> => {
    const mongooseModel = this.getMongooseModel();
    if (!mongooseModel) return null;
    return await mongooseModel.findOne({ _id: id, type: 'faq' }).lean();
  };

  // Create FAQ
  public createFAQ = async (data: IContent): Promise<IContent> => {
    const mongooseModel = this.getMongooseModel();
    if (!mongooseModel) throw new Error('Mongoose model not available');
    const result = await mongooseModel.create({ ...data, type: 'faq' });
    return result.toObject() as IContent;
  };

  // Update FAQ
  public updateFAQ = async (id: string, data: IContent): Promise<IContent | null> => {
    const mongooseModel = this.getMongooseModel();
    if (!mongooseModel) return null;
    const result = await mongooseModel.findOneAndUpdate({ _id: id, type: 'faq' }, data, {
      new: true,
    });
    return result ? (result.toObject() as IContent) : null;
  };

  // Delete FAQ
  public deleteFAQ = async (id: string): Promise<boolean> => {
    const mongooseModel = this.getMongooseModel();
    if (!mongooseModel) return false;
    const result = await mongooseModel.deleteOne({ _id: id, type: 'faq' });
    return result.deletedCount > 0;
  };

  // Update content section (about, privacy, terms)
  public updateContentSection = async (type: string, data: IContent): Promise<IContent | null> => {
    const mongooseModel = this.getMongooseModel();
    if (!mongooseModel) return null;
    const result = await mongooseModel.findOneAndUpdate({ type }, data, {
      upsert: true,
      new: true,
    });
    return result ? (result.toObject() as IContent) : null;
  };

  // Delete all FAQs (for admin reset)
  public deleteAllFAQs = async (): Promise<number> => {
    const mongooseModel = this.getMongooseModel();
    if (!mongooseModel) return 0;
    const result = await mongooseModel.deleteMany({ type: 'faq' });
    return result.deletedCount;
  };

  // Reorder FAQs when inserting at a specific position
  public reorderFAQsOnInsert = async (order: number): Promise<void> => {
    const mongooseModel = this.getMongooseModel();
    if (!mongooseModel) return;

    // Shift all FAQs with order >= provided order by 1
    await mongooseModel.updateMany({ type: 'faq', order: { $gte: order } }, { $inc: { order: 1 } });
  };

  // Reorder FAQs
  public reorderFAQs = async (faqIds: string[]): Promise<void> => {
    const mongooseModel = this.getMongooseModel();
    if (!mongooseModel) return;
    const bulkOps = faqIds.map((id, index) => ({
      updateOne: {
        filter: { _id: id, type: 'faq' },
        update: { order: index },
      },
    }));
    await mongooseModel.bulkWrite(bulkOps);
  };
}
