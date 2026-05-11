export interface OptionGroup {
  display_label: string
  slug: string
  render_type: string
  desc?: string
  is_active?: boolean
  sort_order?: number
  // ── Behaviour flags ───────────────────────────────────────────────────────
  yes_no_required?: boolean
  na_allowed?: boolean
  // ── Drive applicability ───────────────────────────────────────────────────
  applies_to_drives?: string[]
  // ── Direct unit price (yn_with_qty without catalog items) ────────────────
  unit_price?: number
  // ── Qty range ─────────────────────────────────────────────────────────────
  qty_min?: number
  qty_max?: number
  // ── Catalog linkage (legacy — prefer inline items) ────────────────────────
  option_type_filter?: string | null
  option_slug_filter?: string | null
  // ── Fabric picker ─────────────────────────────────────────────────────────
  fabric_types?: string[]
  // ── Option dependency ─────────────────────────────────────────────────────
  depends_on_slug?: string | null
  depends_on_value?: string
  depends_on_width_operator?: '>=' | '<=' | '<' | '>' | '='
  depends_on_width_value?: number | null
  // ── Sub-fields (extra pickers / free-text fields shown inside this group) ─
  sub_fields?: Array<{
    key: string
    label: string
    free_text?: boolean
    options?: string[]
  }>
  // ── Tree structure ────────────────────────────────────────────────────────
  // Inline choice items — replaces OptionCatalog for new-style options
  items?: Array<{
    label: string
    price: number | null
    is_active: boolean
    brand?: string
  }>
  // Child options shown inline when this option is "Yes"
  sub_options?: Array<{
    slug: string
    sort_order?: number
    required?: boolean
  }>
  // Embedded pricing config — replaces scattered catalog pricing
  pricing?: {
    type: string          // flat | per_qty | per_linft | width | per_choice
    amount?: number | null
    width_table?: Record<string, number> | null
  } | null
}
