export interface OptionCatalog {
  slug: string
  option_type: string
  display_name: string
  unit_price: number
  price_unit: string
  is_active: boolean
  qty_based: boolean
  brand?: string
  price_tbd?: boolean
  price_by_width?: boolean
  width_price_table?: Record<string, number>
}
