import { Types } from "mongoose"

export interface ProductType {
  _id?: Types.ObjectId

  category_id: Types.ObjectId

  slug: string
  display_name: string
  full_description: string

  sort_order: number
  is_active: boolean
  drive_type: string

  dimension_config: DimensionConfig
  fabric_config: FabricConfig
  available_options: string[] | Record<string, any>
  installation: InstallationConfig
  extras: Record<string, any>

  createdAt?: Date
  updatedAt?: Date
  deletedAt?: Date | null
}

export interface DimensionConfig {
  pricing_strategy: string
  width_min_ft: number
  width_max_ft: number
  story_options: string[]
}

export interface FabricConfig {
  requires_fabric: boolean
  allowed_fabric_types: string[]
  match_fabric_to_hardware: boolean
}

export interface InstallationConfig {
  first_unit_price: number
  additional_unit_price: number
  width_tier: string
}