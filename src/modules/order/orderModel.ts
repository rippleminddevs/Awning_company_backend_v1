import mongoose from 'mongoose';
import { FieldsConfig } from '../../common/interfaces/fieldTypes';
import { BaseModel } from '../../common/core/baseModel';
import { Order } from './orderInterface';
import { createMongooseSchema } from '../../common/utils/schemaUtils';

const additionalFeaturesFields: FieldsConfig = {
  handheldRemote: { type: 'string', nullable: true },
  motionSensor: { type: 'string', nullable: true },
  ledLight: { type: 'string', nullable: true },
  smartHub: { type: 'string', nullable: true },
  variValance: { type: 'string', nullable: true },
  variPitch: { type: 'string', nullable: true },
  hood: { type: 'string', nullable: true },
  crankHandleLength: { type: 'string', nullable: true },
  customRoofBracket: { type: 'string', nullable: true },
  quantity: { type: 'number', nullable: true },
  furring_ft: { type: 'number', nullable: true },
  spacers_ft: { type: 'number', nullable: true },
  wedges: { type: 'number', nullable: true },
  conduit: { type: 'number', nullable: true },
  additionalCost: { type: 'string', nullable: true },
  additionalCostAmount: { type: 'number', nullable: true },
  instructions: { type: 'string', nullable: true },
  ceilingLights: { type: 'string', nullable: true },
  ceilingFanBeam: { type: 'string', nullable: true },
  ceilingFanInstall: { type: 'string', nullable: true },
  steelForPost: { type: 'string', nullable: true },
  steelForHeader: { type: 'string', nullable: true },
  footings: { type: 'string', nullable: true },
  rafterCut: { type: 'string', nullable: true },
  doubleRaterBeams: { type: 'string', nullable: true },
  doubleHeaderBeams: { type: 'string', nullable: true },
  powerOutlet: { type: 'string', nullable: true },
  custom: { type: 'string', nullable: true },
};

const locationFields: FieldsConfig = {
  latitude: { type: 'number', nullable: true },
  longitude: { type: 'number', nullable: true },
  address: { type: 'string', nullable: true },
};

const fields: FieldsConfig = {
  quoteId: {
    type: 'string',
    mongooseType: 'ObjectId',
    ref: 'Quote',
    nullable: false,
  },
  awningType: {
    type: 'string',
    mongooseType: 'ObjectId',
    ref: 'Category',
    nullable: false,
  },
  product: {
    type: 'string',
    mongooseType: 'ObjectId',
    ref: 'Product',
    nullable: false,
  },
  custom: { type: 'string', nullable: true },
  operation: { type: 'string', nullable: true },
  productName: { type: 'string', nullable: true },
  hardwareColor: { type: 'string', nullable: true },
  roofColor: { type: 'string', nullable: true },
  bays: { type: 'string', nullable: true },
  unitSize: { type: 'string', nullable: true },
  width_ft: { type: 'number', nullable: true },
  width_in: { type: 'number', nullable: true },
  widthFraction: { type: 'string', nullable: true },
  height_ft: { type: 'number', nullable: true },
  height_in: { type: 'number', nullable: true },
  heightFraction: { type: 'string', nullable: true },
  projection_ft: { type: 'number', nullable: true },
  projection_in: { type: 'number', nullable: true },
  projectionFraction: { type: 'string', nullable: true },
  projection: { type: 'string', nullable: true },
  picketSize: { type: 'string', nullable: true },
  picketSpacing: { type: 'string', nullable: true },
  crank: { type: 'string', nullable: true },
  motorized: { type: 'string', nullable: true },
  fabric: { type: 'string', nullable: true },
  fabricTab: { type: 'string', nullable: true },
  magnetLatch: { type: 'string', nullable: true },
  quantity: { type: 'number', nullable: true },
  valancaHeight: { type: 'string', nullable: true },
  valancaStyle: { type: 'string', nullable: true },
  bindingColor: { type: 'string', nullable: true },
  installation: { type: 'string', nullable: true },
  story: { type: 'string', nullable: true },
  description: { type: 'string', nullable: true },
  frameUpgrade: { type: 'string', nullable: true },
  frameUpgradePercentage: { type: 'string', nullable: true },
  post2: { type: 'string', nullable: true },
  post2Percentage: { type: 'string', nullable: true },
  post3: { type: 'string', nullable: true },
  post3Percentage: { type: 'string', nullable: true },
  post4: { type: 'string', nullable: true },
  post4Percentage: { type: 'string', nullable: true },
  unitPrice: { type: 'number', nullable: true },
  location: {
    type: 'object',
    nullable: true,
    document: locationFields,
  },
  additionalFeatures: {
    type: 'object',
    nullable: true,
    document: additionalFeaturesFields,
  },
  createdBy: {
    type: 'string',
    mongooseType: 'ObjectId',
    ref: 'User',
    nullable: false,
  },
};

export class OrderModel extends BaseModel<Order> {
  private static instance: OrderModel;

  constructor() {
    const schema = createMongooseSchema(fields, {
      includeTimestamps: true,
    });
    super('Order', fields, schema);
  }

  public static getInstance(): OrderModel {
    if (!OrderModel.instance) {
      OrderModel.instance = new OrderModel();
    }
    return OrderModel.instance;
  }
}
