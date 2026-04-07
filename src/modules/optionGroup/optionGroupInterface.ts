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
  // ── Catalog linkage ───────────────────────────────────────────────────────
  option_type_filter?: string | null
  option_slug_filter?: string | null
  // ── Sub-fields (extra pickers / free-text fields shown inside this group) ─
  sub_fields?: Array<{
    key: string
    label: string
    free_text?: boolean
    options?: string[]
  }>
}
