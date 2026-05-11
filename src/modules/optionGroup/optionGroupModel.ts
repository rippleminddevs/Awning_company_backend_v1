import { FieldsConfig } from '../../common/interfaces/fieldTypes'
import { BaseModel } from '../../common/core/baseModel'
import { OptionGroup } from './optionGroupInterface'
import { createMongooseSchema } from '../../common/utils/schemaUtils'
import mongoose from 'mongoose'

const subFieldSchema = new mongoose.Schema(
  {
    key:       { type: String, required: true },
    label:     { type: String, required: true },
    free_text: { type: Boolean, default: false },
    options:   { type: [String], default: [] },
  },
  { _id: false }
)

const itemSchema = new mongoose.Schema(
  {
    label:     { type: String, required: true },
    price:     { type: Number, default: null },
    is_active: { type: Boolean, default: true },
    sort_order: { type: Number, default: 1 },
    brand:     { type: String, default: null },
  },
  { _id: false }
)

const subOptionRefSchema = new mongoose.Schema(
  {
    slug:       { type: String, required: true },
    sort_order: { type: Number, default: 1 },
    required:   { type: Boolean, default: false },
  },
  { _id: false }
)

const pricingSchema = new mongoose.Schema(
  {
    type:        { type: String },
    amount:      { type: Number, default: null },
    width_table: { type: mongoose.Schema.Types.Mixed, default: null },
  },
  { _id: false }
)

const fields: FieldsConfig = {
  // Primary identity
  display_label: {
    type: 'string',
    nullable: false,
  },
  slug: {
    type: 'string',
    nullable: false,
    unique: true,
  },
  render_type: {
    type: 'string',
    nullable: false,
  },
  desc: {
    type: 'string',
    nullable: true,
  },
  is_active: {
    type: 'boolean',
    nullable: true,
  },
  sort_order: {
    type: 'number',
    nullable: true,
  },
  // Behaviour flags
  yes_no_required: {
    type: 'boolean',
    nullable: true,
  },
  na_allowed: {
    type: 'boolean',
    nullable: true,
  },
  // Drive applicability  (array of strings: motorized | hand_crank | none)
  applies_to_drives: {
    type: 'array',
    itemType: 'string',
    nullable: true,
  },
  // Qty range for picker/qty render types
  qty_min: {
    type: 'number',
    nullable: true,
  },
  qty_max: {
    type: 'number',
    nullable: true,
  },
  // Direct unit price (used by yn_with_qty when no catalog items are needed)
  unit_price: {
    type: 'number',
    nullable: true,
  },
  // Catalog linkage
  option_type_filter: {
    type: 'string',
    nullable: true,
  },
  option_slug_filter: {
    type: 'string',
    nullable: true,
  },
  // Fabric picker — allowed fabric types
  fabric_types: {
    type: 'array',
    itemType: 'string',
    nullable: true,
  },
  // Option dependency — show this group only when another group matches a value
  depends_on_slug: {
    type: 'string',
    nullable: true,
  },
  depends_on_value: {
    type: 'string',
    nullable: true,
  },
  // Width dependency — show this group only when awning width satisfies the condition
  depends_on_width_operator: {
    type: 'string',
    nullable: true,
  },
  depends_on_width_value: {
    type: 'number',
    nullable: true,
  },
}

export class OptionGroupModel extends BaseModel<OptionGroup> {
  private static instance: OptionGroupModel

  constructor() {
    const schema = createMongooseSchema(fields, {
      includeSoftDelete: true,
      includeTimestamps: true,
    })

    // Complex subdoc arrays are added directly to the Mongoose schema after creation.
    schema.add({ sub_fields:   { type: [subFieldSchema],   default: [] } })
    schema.add({ items:        { type: [itemSchema],        default: [] } })
    schema.add({ sub_options:  { type: [subOptionRefSchema], default: [] } })
    schema.add({ pricing:      { type: pricingSchema,       default: null } })

    schema.index({ slug: 1 }, { unique: true })
    super('OptionGroup', fields, schema)
  }

  public static getInstance(): OptionGroupModel {
    if (!OptionGroupModel.instance) {
      OptionGroupModel.instance = new OptionGroupModel()
    }
    return OptionGroupModel.instance
  }
}
