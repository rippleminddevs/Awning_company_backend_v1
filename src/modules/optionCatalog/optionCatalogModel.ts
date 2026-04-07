import { FieldsConfig } from '../../common/interfaces/fieldTypes'
import { BaseModel } from '../../common/core/baseModel'
import { OptionCatalog } from './optionCatalogInterface'
import { createMongooseSchema } from '../../common/utils/schemaUtils'

const fields: FieldsConfig = {
  slug: {
    type: 'string',
    nullable: false,
  },
  option_type: {
    type: 'string',
    nullable: false,
  },
  display_name: {
    type: 'string',
    nullable: false,
  },
  unit_price: {
    type: 'number',
    nullable: false,
  },
  price_unit: {
    type: 'string',
    nullable: true,
  },
  is_active: {
    type: 'boolean',
    nullable: true,
  },
  qty_based: {
    type: 'boolean',
    nullable: true,
  },
  // ── Optional extended fields ──────────────────────────────────────────────
  brand: {
    type: 'string',
    nullable: true,
  },
  price_tbd: {
    type: 'boolean',
    nullable: true,
  },
  price_by_width: {
    type: 'boolean',
    nullable: true,
  },
  // "flat" = dollar amount, "percent" = % of base product price
  price_type: {
    type: 'string',
    nullable: true,
  },
  // width_price_table is a dynamic map { "10": 515, "12": 609, ... }
  // stored as Mixed so any key set is accepted
  width_price_table: {
    type: 'json',
    nullable: true,
  },
}

export class OptionCatalogModel extends BaseModel<OptionCatalog> {
  private static instance: OptionCatalogModel;
  constructor() {
    const schema = createMongooseSchema(fields, {
      includeTimestamps: true,
      includeSoftDelete: true,
    });
    schema.index({ option_type: 1 });
    schema.index({ slug: 1 });
    super('OptionCatalog', fields, schema)
  }

  public static getInstance(): OptionCatalogModel {
    if (!OptionCatalogModel.instance) {
      OptionCatalogModel.instance = new OptionCatalogModel();
    }
    return OptionCatalogModel.instance;
  }
}
