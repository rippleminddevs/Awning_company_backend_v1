export interface ProductCategory {
  display_name: string
  slug: string
  sort_order: number
  is_active: boolean
  has_sub_categories?: boolean
}