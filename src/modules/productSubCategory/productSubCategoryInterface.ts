export interface ProductSubCategory {
  category_slug: string
  slug: string
  image: string | null
  display_name: string
  description?: string
  sort_order?: number
  is_active?: boolean
}