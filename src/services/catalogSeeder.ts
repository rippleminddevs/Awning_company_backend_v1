// ─────────────────────────────────────────────────────────────────────────────
// catalogSeeder.ts — Seeds all product catalog data into MongoDB
// ─────────────────────────────────────────────────────────────────────────────
import path from 'path'
import fs from 'fs'
import { ProductCategoryModel } from '../modules/productCategory/productCategoryModel'
import { ProductSubCategoryModel } from '../modules/productSubCategory/productSubCategoryModel'
import { ProductTypeModel } from '../modules/productType/productTypeModel'
import { ProductPriceModel } from '../modules/productPrice/productPriceModel'
import { OptionGroupModel } from '../modules/optionGroup/optionGroupModel'
import { OptionCatalogModel } from '../modules/optionCatalog/optionCatalogModel'

function loadPrices(): Record<string, Array<{ width_ft: number; projection_ft: number; msrp: number }>> {
  const filePath = path.join(__dirname, '../../data/all_prices.json')
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'))
}

// ─────────────────────────────────────────────────────────────────────────────
// Catalog Definitions
// ─────────────────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { display_name: 'Retractable Awnings', slug: 'retractable', sort_order: 1, is_active: true, has_sub_categories: false },
  { display_name: 'Window Awnings',      slug: 'window-awnings', sort_order: 2, is_active: true, has_sub_categories: false },
  { display_name: 'Drop Shades',         slug: 'drop-shades',    sort_order: 3, is_active: true, has_sub_categories: false },
  { display_name: 'Vertex & Pinnacle',   slug: 'vertex-pinnacle', sort_order: 4, is_active: true, has_sub_categories: false },
  { display_name: 'Fixed Awnings',       slug: 'fixed-awnings',  sort_order: 5, is_active: true, has_sub_categories: false },
  { display_name: 'Alumawood',           slug: 'alumawood',      sort_order: 6, is_active: true, has_sub_categories: true },
  { display_name: 'Louvered Roof',       slug: 'louvered-roof',  sort_order: 7, is_active: true, has_sub_categories: false },
  { display_name: 'Infinity Canopies',   slug: 'infinity',       sort_order: 8, is_active: true, has_sub_categories: false },
  { display_name: 'Slide on Wire',       slug: 'slide-on-wire',  sort_order: 9, is_active: true, has_sub_categories: false },
  { display_name: 'Fabric Recovers',     slug: 'recovers',       sort_order: 10, is_active: true, has_sub_categories: false },
]

const SUB_CATEGORIES = [
  { category_slug: 'alumawood', slug: 'alumawood-laguna',  display_name: 'Laguna (Lattice)',       sort_order: 1, is_active: true },
  { category_slug: 'alumawood', slug: 'alumawood-newport', display_name: 'Newport (Solid Pan)',    sort_order: 2, is_active: true },
  { category_slug: 'alumawood', slug: 'alumawood-dana',    display_name: 'Dana (3" Insulated)',    sort_order: 3, is_active: true },
]

// ─── Installation pricing helper ─────────────────────────────────────────────
const INSTALLATION: Record<string, { first_unit: number; each_additional: number; price_unit?: string }> = {
  milan_motorized:           { first_unit: 495, each_additional: 395 },
  milan_hand_crank:          { first_unit: 395, each_additional: 295 },
  milan_semi_cassette_motorized: { first_unit: 495, each_additional: 395 },
  verona_motorized:          { first_unit: 695, each_additional: 545 },
  domina_motorized:          { first_unit: 695, each_additional: 545 },
  bella_plus_motorized:      { first_unit: 995, each_additional: 845 },
  window_awning_motorized:   { first_unit: 465, each_additional: 295 },
  window_awning_hand_crank:  { first_unit: 365, each_additional: 225 },
  vertex_motorized:          { first_unit: 595, each_additional: 395 },
  pinnacle_motorized:        { first_unit: 595, each_additional: 395 },
  drop_shade_motorized:      { first_unit: 445, each_additional: 295 },
  drop_shade_hand_crank:     { first_unit: 345, each_additional: 225 },
  zip_track_4_motorized:     { first_unit: 595, each_additional: 450 },
  zip_track_5_motorized:     { first_unit: 595, each_additional: 450 },
  zip_track_6_motorized:     { first_unit: 595, each_additional: 450 },
  alumawood_laguna:          { first_unit: 3.25, each_additional: 3.25, price_unit: 'sqft' },
  alumawood_newport:         { first_unit: 2.75, each_additional: 2.75, price_unit: 'sqft' },
  alumawood_dana:            { first_unit: 3.25, each_additional: 3.25, price_unit: 'sqft' },
  infinity_canopy:           { first_unit: 175, each_additional: 175, price_unit: 'per_panel' },
  retractable_recover:       { first_unit: 325, each_additional: 195 },
  drop_shade_recover:        { first_unit: 265, each_additional: 195 },
  zip_track_recover:         { first_unit: 265, each_additional: 195 },
}

// ─── Product Types ────────────────────────────────────────────────────────────
const PRODUCT_TYPES = [
  // ── Retractable ──────────────────────────────────────────────────────────
  {
    category_slug: 'retractable', slug: 'milan_motorized', display_name: 'Milan Motorized',
    full_description: 'Full cassette motorized retractable awning with hood. Premium residential and commercial option.',
    sort_order: 1, is_active: true, drive_type: 'motorized',
    price_lookup_mode: 'width_x_projection',
    dimension_fields: [
      { key: 'width', label: 'Width (ft)', type: 'number', min: 7, max: 40 },
      { key: 'projection', label: 'Projection (ft)', type: 'select', options: [6,8,10,12,13] },
    ],
    fabric_config: { required: true, type: 'sunbrella' },
    option_groups: ['retractable_hood','retractable_electronics','retractable_vari_valance','retractable_crank_handle'],
    installation: INSTALLATION.milan_motorized,
  },
  {
    category_slug: 'retractable', slug: 'milan_hand_crank', display_name: 'Milan Hand Crank',
    full_description: 'Full cassette hand crank retractable awning with hood.',
    sort_order: 2, is_active: true, drive_type: 'hand_crank',
    price_lookup_mode: 'width_x_projection',
    dimension_fields: [
      { key: 'width', label: 'Width (ft)', type: 'number', min: 7, max: 40 },
      { key: 'projection', label: 'Projection (ft)', type: 'select', options: [6,8,10,12] },
    ],
    fabric_config: { required: true, type: 'sunbrella' },
    option_groups: ['retractable_hood','retractable_vari_valance'],
    installation: INSTALLATION.milan_hand_crank,
  },
  {
    category_slug: 'retractable', slug: 'milan_semi_cassette_motorized', display_name: 'Milan Semi-Cassette Motorized',
    full_description: 'Semi-cassette motorized retractable awning.',
    sort_order: 3, is_active: true, drive_type: 'motorized',
    price_lookup_mode: 'width_x_projection',
    dimension_fields: [
      { key: 'width', label: 'Width (ft)', type: 'number', min: 7, max: 20 },
      { key: 'projection', label: 'Projection (ft)', type: 'select', options: [6,8,10] },
    ],
    fabric_config: { required: true, type: 'sunbrella' },
    option_groups: ['retractable_electronics','retractable_crank_handle'],
    installation: INSTALLATION.milan_semi_cassette_motorized,
  },
  {
    category_slug: 'retractable', slug: 'verona_motorized', display_name: 'Verona Motorized',
    full_description: 'Full cassette motorized retractable awning — Verona model.',
    sort_order: 4, is_active: true, drive_type: 'motorized',
    price_lookup_mode: 'width_x_projection',
    dimension_fields: [
      { key: 'width', label: 'Width (ft)', type: 'number', min: 10, max: 20 },
      { key: 'projection', label: 'Projection (ft)', type: 'select', options: [8,10,13] },
    ],
    fabric_config: { required: true, type: 'sunbrella' },
    option_groups: ['retractable_hood','retractable_electronics','retractable_vari_valance','retractable_crank_handle'],
    installation: INSTALLATION.verona_motorized,
  },
  {
    category_slug: 'retractable', slug: 'bella_plus_motorized', display_name: 'Bella Plus Motorized',
    full_description: 'Bella Plus full cassette motorized retractable awning.',
    sort_order: 5, is_active: true, drive_type: 'motorized',
    price_lookup_mode: 'width_x_projection',
    dimension_fields: [
      { key: 'width', label: 'Width (ft)', type: 'number', min: 7, max: 30 },
      { key: 'projection', label: 'Projection (ft)', type: 'select', options: [6,8,10,12,13] },
    ],
    fabric_config: { required: true, type: 'sunbrella' },
    option_groups: ['retractable_hood','retractable_electronics','retractable_vari_valance','retractable_crank_handle'],
    installation: INSTALLATION.bella_plus_motorized,
  },
  {
    category_slug: 'retractable', slug: 'domina_motorized', display_name: 'Domina Motorized',
    full_description: 'Domina full cassette motorized retractable awning.',
    sort_order: 6, is_active: true, drive_type: 'motorized',
    price_lookup_mode: 'width_x_projection',
    dimension_fields: [
      { key: 'width', label: 'Width (ft)', type: 'number', min: 7, max: 24 },
      { key: 'projection', label: 'Projection (ft)', type: 'select', options: [8,10,12,13] },
    ],
    fabric_config: { required: true, type: 'sunbrella' },
    option_groups: ['retractable_hood','retractable_electronics','retractable_vari_valance','retractable_crank_handle'],
    installation: INSTALLATION.domina_motorized,
  },

  // ── Window Awnings ───────────────────────────────────────────────────────
  {
    category_slug: 'window-awnings', slug: 'window_awning_motorized', display_name: 'Window Awning Motorized',
    full_description: 'Motorized window awning — fixed frame with retractable fabric.',
    sort_order: 1, is_active: true, drive_type: 'motorized',
    price_lookup_mode: 'width_x_projection',
    dimension_fields: [
      { key: 'width', label: 'Width (ft)', type: 'number', min: 4, max: 20 },
      { key: 'projection', label: 'Projection (ft)', type: 'select', options: [2,3,4,5] },
    ],
    fabric_config: { required: true, type: 'sunbrella' },
    option_groups: ['window_awning_hood','retractable_electronics','retractable_crank_handle'],
    installation: INSTALLATION.window_awning_motorized,
  },
  {
    category_slug: 'window-awnings', slug: 'window_awning_hand_crank', display_name: 'Window Awning Hand Crank',
    full_description: 'Hand crank window awning — fixed frame with retractable fabric.',
    sort_order: 2, is_active: true, drive_type: 'hand_crank',
    price_lookup_mode: 'width_x_projection',
    dimension_fields: [
      { key: 'width', label: 'Width (ft)', type: 'number', min: 4, max: 20 },
      { key: 'projection', label: 'Projection (ft)', type: 'select', options: [2,3,4,5] },
    ],
    fabric_config: { required: true, type: 'sunbrella' },
    option_groups: ['window_awning_hood'],
    installation: INSTALLATION.window_awning_hand_crank,
  },

  // ── Drop Shades ──────────────────────────────────────────────────────────
  {
    category_slug: 'drop-shades', slug: 'drop_shade_motorized', display_name: 'Drop Shade Motorized',
    full_description: 'Motorized drop shade — external solar screen for patios.',
    sort_order: 1, is_active: true, drive_type: 'motorized',
    price_lookup_mode: 'width_x_projection',
    dimension_fields: [
      { key: 'width', label: 'Width (ft)', type: 'number', min: 4, max: 20 },
      { key: 'projection', label: 'Drop (ft)', type: 'number', min: 4, max: 20 },
    ],
    fabric_config: { required: true, type: 'textilene' },
    option_groups: ['drop_shade_hood','retractable_electronics','retractable_crank_handle'],
    installation: INSTALLATION.drop_shade_motorized,
  },
  {
    category_slug: 'drop-shades', slug: 'drop_shade_hand_crank', display_name: 'Drop Shade Hand Crank',
    full_description: 'Hand crank drop shade — external solar screen for patios.',
    sort_order: 2, is_active: true, drive_type: 'hand_crank',
    price_lookup_mode: 'width_x_projection',
    dimension_fields: [
      { key: 'width', label: 'Width (ft)', type: 'number', min: 4, max: 20 },
      { key: 'projection', label: 'Drop (ft)', type: 'number', min: 4, max: 20 },
    ],
    fabric_config: { required: true, type: 'textilene' },
    option_groups: ['drop_shade_hood'],
    installation: INSTALLATION.drop_shade_hand_crank,
  },
  {
    category_slug: 'drop-shades', slug: 'zip_track_4_motorized', display_name: 'Zip Track 4" Motorized',
    full_description: 'Motorized zip track drop shade — 4" channel system for side retention.',
    sort_order: 3, is_active: true, drive_type: 'motorized',
    price_lookup_mode: 'width_x_projection',
    dimension_fields: [
      { key: 'width', label: 'Width (ft)', type: 'number', min: 4, max: 20 },
      { key: 'projection', label: 'Drop (ft)', type: 'number', min: 4, max: 20 },
    ],
    fabric_config: { required: true, type: 'textilene' },
    option_groups: ['retractable_electronics','retractable_crank_handle'],
    installation: INSTALLATION.zip_track_4_motorized,
  },
  {
    category_slug: 'drop-shades', slug: 'zip_track_5_motorized', display_name: 'Zip Track 5" Motorized',
    full_description: 'Motorized zip track drop shade — 5" channel system.',
    sort_order: 4, is_active: true, drive_type: 'motorized',
    price_lookup_mode: 'width_x_projection',
    dimension_fields: [
      { key: 'width', label: 'Width (ft)', type: 'number', min: 4, max: 20 },
      { key: 'projection', label: 'Drop (ft)', type: 'number', min: 4, max: 20 },
    ],
    fabric_config: { required: true, type: 'textilene' },
    option_groups: ['retractable_electronics','retractable_crank_handle'],
    installation: INSTALLATION.zip_track_5_motorized,
  },
  {
    category_slug: 'drop-shades', slug: 'zip_track_6_motorized', display_name: 'Zip Track 6" Motorized',
    full_description: 'Motorized zip track drop shade — 6" channel system.',
    sort_order: 5, is_active: true, drive_type: 'motorized',
    price_lookup_mode: 'width_x_projection',
    dimension_fields: [
      { key: 'width', label: 'Width (ft)', type: 'number', min: 4, max: 20 },
      { key: 'projection', label: 'Drop (ft)', type: 'number', min: 4, max: 20 },
    ],
    fabric_config: { required: true, type: 'textilene' },
    option_groups: ['retractable_electronics','retractable_crank_handle'],
    installation: INSTALLATION.zip_track_6_motorized,
  },

  // ── Vertex & Pinnacle ────────────────────────────────────────────────────
  {
    category_slug: 'vertex-pinnacle', slug: 'vertex_motorized', display_name: 'Vertex Motorized',
    full_description: 'Vertex pergola-style motorized awning — freestanding or wall-mounted.',
    sort_order: 1, is_active: true, drive_type: 'motorized',
    price_lookup_mode: 'width_x_projection',
    dimension_fields: [
      { key: 'width', label: 'Width (ft)', type: 'number', min: 7, max: 36 },
      { key: 'projection', label: 'Projection (ft)', type: 'number', min: 7, max: 20 },
    ],
    fabric_config: { required: true, type: 'sunbrella' },
    option_groups: ['retractable_electronics','retractable_crank_handle'],
    installation: INSTALLATION.vertex_motorized,
  },
  {
    category_slug: 'vertex-pinnacle', slug: 'pinnacle_motorized', display_name: 'Pinnacle Motorized',
    full_description: 'Pinnacle pergola-style motorized awning.',
    sort_order: 2, is_active: true, drive_type: 'motorized',
    price_lookup_mode: 'width_x_projection',
    dimension_fields: [
      { key: 'width', label: 'Width (ft)', type: 'number', min: 7, max: 36 },
      { key: 'projection', label: 'Projection (ft)', type: 'number', min: 7, max: 20 },
    ],
    fabric_config: { required: true, type: 'sunbrella' },
    option_groups: ['retractable_electronics','retractable_crank_handle'],
    installation: INSTALLATION.pinnacle_motorized,
  },

  // ── Fixed Awnings ────────────────────────────────────────────────────────
  {
    category_slug: 'fixed-awnings', slug: 'dome_fixed_awning', display_name: 'Dome Fixed Awning',
    full_description: 'Classic dome-style fixed fabric awning.',
    sort_order: 1, is_active: true, drive_type: 'none',
    price_lookup_mode: 'width_x_projection',
    dimension_fields: [
      { key: 'width', label: 'Width (ft)', type: 'number', min: 2, max: 20 },
      { key: 'projection', label: 'Projection (ft)', type: 'number', min: 1, max: 8 },
    ],
    fabric_config: { required: true, type: 'sunbrella' },
    option_groups: [],
    installation: { first_unit: 245, each_additional: 125, tier_breakpoints: [{ max_width: 10, first_unit: 245, each_additional: 125 }, { max_width: 20, first_unit: 295, each_additional: 175 }, { max_width: 30, first_unit: 495, each_additional: 225 }] },
  },
  {
    category_slug: 'fixed-awnings', slug: 'long_dome_fixed_awning', display_name: 'Long Dome Fixed Awning',
    full_description: 'Elongated dome-style fixed fabric awning.',
    sort_order: 2, is_active: true, drive_type: 'none',
    price_lookup_mode: 'width_x_projection',
    dimension_fields: [
      { key: 'width', label: 'Width (ft)', type: 'number', min: 2, max: 20 },
      { key: 'projection', label: 'Projection (ft)', type: 'number', min: 1, max: 8 },
    ],
    fabric_config: { required: true, type: 'sunbrella' },
    option_groups: [],
    installation: { first_unit: 245, each_additional: 125 },
  },
  {
    category_slug: 'fixed-awnings', slug: 'orleans_fixed_awning', display_name: 'Orleans Fixed Awning',
    full_description: 'Orleans style fixed fabric awning.',
    sort_order: 3, is_active: true, drive_type: 'none',
    price_lookup_mode: 'width_x_projection',
    dimension_fields: [
      { key: 'width', label: 'Width (ft)', type: 'number', min: 2, max: 20 },
      { key: 'projection', label: 'Projection (ft)', type: 'number', min: 1, max: 8 },
    ],
    fabric_config: { required: true, type: 'sunbrella' },
    option_groups: [],
    installation: { first_unit: 245, each_additional: 125 },
  },
  {
    category_slug: 'fixed-awnings', slug: 'riviera_fixed_awning', display_name: 'Riviera Fixed Awning',
    full_description: 'Riviera style fixed fabric awning.',
    sort_order: 4, is_active: true, drive_type: 'none',
    price_lookup_mode: 'width_x_projection',
    dimension_fields: [
      { key: 'width', label: 'Width (ft)', type: 'number', min: 2, max: 20 },
      { key: 'projection', label: 'Projection (ft)', type: 'number', min: 1, max: 8 },
    ],
    fabric_config: { required: true, type: 'sunbrella' },
    option_groups: [],
    installation: { first_unit: 245, each_additional: 125 },
  },
  {
    category_slug: 'fixed-awnings', slug: 'scroll_fixed_awning', display_name: 'Scroll Fixed Awning',
    full_description: 'Scroll style fixed fabric awning.',
    sort_order: 5, is_active: true, drive_type: 'none',
    price_lookup_mode: 'width_x_projection',
    dimension_fields: [
      { key: 'width', label: 'Width (ft)', type: 'number', min: 2, max: 20 },
      { key: 'projection', label: 'Projection (ft)', type: 'number', min: 1, max: 8 },
    ],
    fabric_config: { required: true, type: 'sunbrella' },
    option_groups: [],
    installation: { first_unit: 245, each_additional: 125 },
  },
  {
    category_slug: 'fixed-awnings', slug: 'spear_fixed_awning', display_name: 'Spear Fixed Awning',
    full_description: 'Spear (open) style fixed fabric awning.',
    sort_order: 6, is_active: true, drive_type: 'none',
    price_lookup_mode: 'width_x_projection',
    dimension_fields: [
      { key: 'width', label: 'Width (ft)', type: 'number', min: 2, max: 20 },
      { key: 'projection', label: 'Projection (ft)', type: 'number', min: 1, max: 8 },
    ],
    fabric_config: { required: true, type: 'sunbrella' },
    option_groups: [],
    installation: { first_unit: 245, each_additional: 125 },
  },

  // ── Alumawood ────────────────────────────────────────────────────────────
  {
    category_slug: 'alumawood', sub_category_slug: 'alumawood-laguna',
    slug: 'alumawood_laguna', display_name: 'Alumawood Laguna (Lattice)',
    full_description: 'Alumawood lattice patio cover — Laguna series.',
    sort_order: 1, is_active: true, drive_type: 'none',
    price_lookup_mode: 'sqft',
    dimension_fields: [
      { key: 'width', label: 'Width (ft)', type: 'number', min: 6, max: 60 },
      { key: 'projection', label: 'Projection (ft)', type: 'number', min: 6, max: 40 },
    ],
    fabric_config: { required: false },
    option_groups: [],
    installation: INSTALLATION.alumawood_laguna,
    alumawood_config: { style: 'lattice', price_per_sqft: 3.25 },
  },
  {
    category_slug: 'alumawood', sub_category_slug: 'alumawood-newport',
    slug: 'alumawood_newport', display_name: 'Alumawood Newport (Solid Pan)',
    full_description: 'Alumawood solid pan patio cover — Newport series.',
    sort_order: 2, is_active: true, drive_type: 'none',
    price_lookup_mode: 'sqft',
    dimension_fields: [
      { key: 'width', label: 'Width (ft)', type: 'number', min: 6, max: 60 },
      { key: 'projection', label: 'Projection (ft)', type: 'number', min: 6, max: 40 },
    ],
    fabric_config: { required: false },
    option_groups: [],
    installation: INSTALLATION.alumawood_newport,
    alumawood_config: { style: 'solid_pan', price_per_sqft: 2.75 },
  },
  {
    category_slug: 'alumawood', sub_category_slug: 'alumawood-dana',
    slug: 'alumawood_dana', display_name: 'Alumawood Dana (3" Insulated)',
    full_description: 'Alumawood insulated patio cover — Dana series.',
    sort_order: 3, is_active: true, drive_type: 'none',
    price_lookup_mode: 'sqft',
    dimension_fields: [
      { key: 'width', label: 'Width (ft)', type: 'number', min: 6, max: 60 },
      { key: 'projection', label: 'Projection (ft)', type: 'number', min: 6, max: 40 },
    ],
    fabric_config: { required: false },
    option_groups: [],
    installation: INSTALLATION.alumawood_dana,
    alumawood_config: { style: 'insulated', price_per_sqft: 3.25 },
  },

  // ── Louvered Roof ────────────────────────────────────────────────────────
  {
    category_slug: 'louvered-roof', slug: 'genoa_louvered_roof', display_name: 'Genoa Louvered Roof',
    full_description: 'Genoa adjustable louvered roof system.',
    sort_order: 1, is_active: true, drive_type: 'motorized',
    price_lookup_mode: 'manual',
    dimension_fields: [
      { key: 'width', label: 'Width (ft)', type: 'number', min: 8, max: 30 },
      { key: 'projection', label: 'Projection (ft)', type: 'number', min: 8, max: 20 },
    ],
    fabric_config: { required: false },
    option_groups: ['retractable_electronics'],
    installation: { first_unit: 995, each_additional: 795 },
    louvered_config: { brand: 'Genoa' },
  },
  {
    category_slug: 'louvered-roof', slug: 'ke_prime_louvered_roof', display_name: 'KE Prime Louvered Roof',
    full_description: 'KE Prime adjustable louvered roof system.',
    sort_order: 2, is_active: true, drive_type: 'motorized',
    price_lookup_mode: 'manual',
    dimension_fields: [
      { key: 'width', label: 'Width (ft)', type: 'number', min: 8, max: 30 },
      { key: 'projection', label: 'Projection (ft)', type: 'number', min: 8, max: 20 },
    ],
    fabric_config: { required: false },
    option_groups: ['retractable_electronics'],
    installation: { first_unit: 995, each_additional: 795 },
    louvered_config: { brand: 'KE', model: 'Prime' },
  },
  {
    category_slug: 'louvered-roof', slug: 'ke_plus_louvered_roof', display_name: 'KE Plus Louvered Roof',
    full_description: 'KE Plus adjustable louvered roof system.',
    sort_order: 3, is_active: true, drive_type: 'motorized',
    price_lookup_mode: 'manual',
    dimension_fields: [
      { key: 'width', label: 'Width (ft)', type: 'number', min: 8, max: 30 },
      { key: 'projection', label: 'Projection (ft)', type: 'number', min: 8, max: 20 },
    ],
    fabric_config: { required: false },
    option_groups: ['retractable_electronics'],
    installation: { first_unit: 995, each_additional: 795 },
    louvered_config: { brand: 'KE', model: 'Plus' },
  },
  {
    category_slug: 'louvered-roof', slug: 'toscana_louvered_roof', display_name: 'Toscana Louvered Roof',
    full_description: 'Toscana adjustable louvered roof system.',
    sort_order: 4, is_active: true, drive_type: 'motorized',
    price_lookup_mode: 'manual',
    dimension_fields: [
      { key: 'width', label: 'Width (ft)', type: 'number', min: 8, max: 30 },
      { key: 'projection', label: 'Projection (ft)', type: 'number', min: 8, max: 20 },
    ],
    fabric_config: { required: false },
    option_groups: ['retractable_electronics'],
    installation: { first_unit: 995, each_additional: 795 },
    louvered_config: { brand: 'Toscana' },
  },
  {
    category_slug: 'louvered-roof', slug: 'skymatik_louvered_roof', display_name: 'Skymatik Louvered Roof',
    full_description: 'Skymatik adjustable louvered roof system.',
    sort_order: 5, is_active: true, drive_type: 'motorized',
    price_lookup_mode: 'manual',
    dimension_fields: [
      { key: 'width', label: 'Width (ft)', type: 'number', min: 8, max: 30 },
      { key: 'projection', label: 'Projection (ft)', type: 'number', min: 8, max: 20 },
    ],
    fabric_config: { required: false },
    option_groups: ['retractable_electronics'],
    installation: { first_unit: 995, each_additional: 795 },
    louvered_config: { brand: 'Skymatik' },
  },

  // ── Infinity Canopies ────────────────────────────────────────────────────
  {
    category_slug: 'infinity', slug: 'infinity_canopy', display_name: 'Infinity Canopy',
    full_description: 'Slide-on-wire infinity canopy system.',
    sort_order: 1, is_active: true, drive_type: 'none',
    price_lookup_mode: 'width_x_projection',
    dimension_fields: [
      { key: 'width', label: 'Width (ft)', type: 'number', min: 4, max: 30 },
      { key: 'projection', label: 'Length (ft)', type: 'number', min: 4, max: 30 },
    ],
    fabric_config: { required: true, type: 'sunbrella' },
    option_groups: [],
    installation: INSTALLATION.infinity_canopy,
    infinity_config: { price_unit: 'per_panel' },
  },

  // ── Slide on Wire ────────────────────────────────────────────────────────
  {
    category_slug: 'slide-on-wire', slug: 'slide_on_wire', display_name: 'Slide on Wire',
    full_description: 'Slide-on-wire outdoor shade sail system priced per panel.',
    sort_order: 1, is_active: true, drive_type: 'none',
    price_lookup_mode: 'manual',
    dimension_fields: [
      { key: 'width', label: 'Width (ft)', type: 'number', min: 4, max: 20 },
      { key: 'projection', label: 'Length (ft)', type: 'number', min: 4, max: 30 },
    ],
    fabric_config: { required: true, type: 'sunbrella' },
    option_groups: [],
    installation: { first_unit: 175, each_additional: 175, price_unit: 'per_panel' },
  },

  // ── Fabric Recovers ──────────────────────────────────────────────────────
  {
    category_slug: 'recovers', slug: 'retractable_recover', display_name: 'Retractable Awning Recover',
    full_description: 'Fabric recover for existing retractable awning.',
    sort_order: 1, is_active: true, drive_type: 'none',
    price_lookup_mode: 'width_x_projection',
    dimension_fields: [
      { key: 'width', label: 'Width (ft)', type: 'number', min: 7, max: 40 },
      { key: 'projection', label: 'Projection (ft)', type: 'select', options: [6,8,10,12,13] },
    ],
    fabric_config: { required: true, type: 'sunbrella' },
    option_groups: [],
    installation: INSTALLATION.retractable_recover,
  },
  {
    category_slug: 'recovers', slug: 'dome_fixed_awning_recover', display_name: 'Dome Fixed Awning Recover',
    full_description: 'Fabric recover for dome fixed awning.',
    sort_order: 2, is_active: true, drive_type: 'none',
    price_lookup_mode: 'width_x_projection',
    dimension_fields: [
      { key: 'width', label: 'Width (ft)', type: 'number', min: 2, max: 20 },
      { key: 'projection', label: 'Projection (ft)', type: 'number', min: 1, max: 8 },
    ],
    fabric_config: { required: true, type: 'sunbrella' },
    option_groups: [],
    installation: { first_unit: 265, each_additional: 195 },
  },
  {
    category_slug: 'recovers', slug: 'long_dome_recover', display_name: 'Long Dome Recover',
    full_description: 'Fabric recover for long dome awning.',
    sort_order: 3, is_active: true, drive_type: 'none',
    price_lookup_mode: 'width_x_projection',
    dimension_fields: [
      { key: 'width', label: 'Width (ft)', type: 'number', min: 2, max: 20 },
      { key: 'projection', label: 'Projection (ft)', type: 'number', min: 1, max: 8 },
    ],
    fabric_config: { required: true, type: 'sunbrella' },
    option_groups: [],
    installation: { first_unit: 265, each_additional: 195 },
  },
  {
    category_slug: 'recovers', slug: 'orleans_recover', display_name: 'Orleans Recover',
    full_description: 'Fabric recover for Orleans style awning.',
    sort_order: 4, is_active: true, drive_type: 'none',
    price_lookup_mode: 'width_x_projection',
    dimension_fields: [
      { key: 'width', label: 'Width (ft)', type: 'number', min: 2, max: 20 },
      { key: 'projection', label: 'Projection (ft)', type: 'number', min: 1, max: 8 },
    ],
    fabric_config: { required: true, type: 'sunbrella' },
    option_groups: [],
    installation: { first_unit: 265, each_additional: 195 },
  },
  {
    category_slug: 'recovers', slug: 'riviera_fixed_awning_recover', display_name: 'Riviera Recover',
    full_description: 'Fabric recover for Riviera style awning.',
    sort_order: 5, is_active: true, drive_type: 'none',
    price_lookup_mode: 'width_x_projection',
    dimension_fields: [
      { key: 'width', label: 'Width (ft)', type: 'number', min: 2, max: 20 },
      { key: 'projection', label: 'Projection (ft)', type: 'number', min: 1, max: 8 },
    ],
    fabric_config: { required: true, type: 'sunbrella' },
    option_groups: [],
    installation: { first_unit: 265, each_additional: 195 },
  },
  {
    category_slug: 'recovers', slug: 'spear_awning_recover', display_name: 'Spear Awning Recover',
    full_description: 'Fabric recover for spear style awning.',
    sort_order: 6, is_active: true, drive_type: 'none',
    price_lookup_mode: 'width_x_projection',
    dimension_fields: [
      { key: 'width', label: 'Width (ft)', type: 'number', min: 2, max: 20 },
      { key: 'projection', label: 'Projection (ft)', type: 'number', min: 1, max: 8 },
    ],
    fabric_config: { required: true, type: 'sunbrella' },
    option_groups: [],
    installation: { first_unit: 265, each_additional: 195 },
  },
  {
    category_slug: 'recovers', slug: 'drop_shade_recover', display_name: 'Drop Shade Recover',
    full_description: 'Fabric recover for drop shade.',
    sort_order: 7, is_active: true, drive_type: 'none',
    price_lookup_mode: 'width_x_projection',
    dimension_fields: [
      { key: 'width', label: 'Width (ft)', type: 'number', min: 4, max: 20 },
      { key: 'projection', label: 'Drop (ft)', type: 'number', min: 4, max: 20 },
    ],
    fabric_config: { required: true, type: 'textilene' },
    option_groups: [],
    installation: INSTALLATION.drop_shade_recover,
  },
  {
    category_slug: 'recovers', slug: 'zip_track_recover', display_name: 'Zip Track Recover',
    full_description: 'Fabric recover for zip track drop shade.',
    sort_order: 8, is_active: true, drive_type: 'none',
    price_lookup_mode: 'width_x_projection',
    dimension_fields: [
      { key: 'width', label: 'Width (ft)', type: 'number', min: 4, max: 20 },
      { key: 'projection', label: 'Drop (ft)', type: 'number', min: 4, max: 20 },
    ],
    fabric_config: { required: true, type: 'textilene' },
    option_groups: [],
    installation: { first_unit: 265, each_additional: 195 },
  },
  {
    category_slug: 'recovers', slug: 'infinity_sow_recover', display_name: 'Infinity / Slide-on-Wire Recover',
    full_description: 'Fabric recover for infinity canopy or slide-on-wire panels.',
    sort_order: 9, is_active: true, drive_type: 'none',
    price_lookup_mode: 'width_x_projection',
    dimension_fields: [
      { key: 'width', label: 'Width (ft)', type: 'number', min: 4, max: 20 },
      { key: 'projection', label: 'Length (ft)', type: 'number', min: 4, max: 30 },
    ],
    fabric_config: { required: true, type: 'sunbrella' },
    option_groups: [],
    installation: { first_unit: 175, each_additional: 175 },
  },
]

// ─── Option Groups ────────────────────────────────────────────────────────────
const OPTION_GROUPS = [
  {
    slug: 'retractable_hood',
    display_label: 'Hood',
    render_type: 'width_priced',
    yes_no_required: true,
    na_allowed: false,
    applies_to_drives: ['motorized','hand_crank'],
    sort_order: 1,
    option_type_filter: 'retractable_hood',
    is_active: true,
  },
  {
    slug: 'drop_shade_hood',
    display_label: 'Hood',
    render_type: 'width_priced',
    yes_no_required: true,
    na_allowed: false,
    applies_to_drives: ['motorized','hand_crank'],
    sort_order: 1,
    option_type_filter: 'drop_shade_hood',
    is_active: true,
  },
  {
    slug: 'window_awning_hood',
    display_label: 'Hood',
    render_type: 'width_priced',
    yes_no_required: true,
    na_allowed: false,
    applies_to_drives: ['motorized','hand_crank'],
    sort_order: 1,
    option_type_filter: 'window_awning_hood',
    is_active: true,
  },
  {
    slug: 'retractable_electronics',
    display_label: 'Electronics / Remote Kit',
    render_type: 'brand_qty',
    yes_no_required: false,
    na_allowed: true,
    applies_to_drives: ['motorized'],
    sort_order: 2,
    option_type_filter: 'remote_kit',
    is_active: true,
  },
  {
    slug: 'retractable_vari_valance',
    display_label: 'Vari Valance',
    render_type: 'yn_then_picker',
    yes_no_required: true,
    na_allowed: false,
    applies_to_drives: ['motorized','hand_crank'],
    sort_order: 3,
    option_type_filter: 'vari_valance',
    is_active: true,
  },
  {
    slug: 'retractable_crank_handle',
    display_label: 'Crank Handle',
    render_type: 'yn_toggle',
    yes_no_required: true,
    na_allowed: false,
    applies_to_drives: ['motorized','hand_crank'],
    sort_order: 4,
    option_type_filter: 'crank_handle',
    is_active: true,
  },
]

// ─── Option Catalog Items ─────────────────────────────────────────────────────
// Hood items — Milan hood (width 8-40), Drop Shade hood (4-20), Window Awning hood (4-20)
const milanHoodPrices: [number, number][] = [
  [8,421],[9,468],[10,515],[11,562],[12,609],[13,656],[14,703],[15,750],[16,797],
  [17,844],[18,891],[19,938],[20,985],[21,1032],[22,1079],[23,1126],[24,1173],
  [25,1220],[26,1267],[27,1314],[28,1361],[29,1408],[30,1455],[31,1502],[32,1549],
  [33,1596],[34,1643],[35,1690],[36,1737],[37,1784],[38,1831],[39,1878],[40,1925],
]
const dropShadeHoodPrices: [number, number][] = [
  [4,188],[5,235],[6,282],[7,329],[8,376],[9,423],[10,470],[11,517],[12,564],
  [13,611],[14,658],[15,705],[16,752],[17,799],[18,846],[19,893],[20,940],
]
const windowAwningHoodPrices: [number, number][] = [
  [4,229],[5,274],[6,321],[7,368],[8,415],[9,462],[10,508],[11,555],[12,601],
  [13,647],[14,693],[15,742],[16,789],[17,836],[18,882],[19,929],[20,976],
]

// Remote kits
const REMOTE_KITS = [
  { slug: 'kit_101_spettmann', display_name: 'Kit 101 / 1 Chn Remote & Motor Upgrade (Spettmann)', unit_price: 215, option_type: 'remote_kit', price_unit: 'flat', qty_based: false },
  { slug: 'kit_102_spettmann', display_name: 'Kit 102 / 5 Chn Remote & Motor Upgrade (Spettmann)', unit_price: 335, option_type: 'remote_kit', price_unit: 'flat', qty_based: false },
  { slug: 'kit_103_spettmann', display_name: 'Kit 103 / 5 Chn Remote & Motor Upgrade (Spettmann)', unit_price: 445, option_type: 'remote_kit', price_unit: 'flat', qty_based: false },
  { slug: 'kit_104_spettmann', display_name: 'Kit 104 / 5 Chn Remote & Motor Upgrade (Spettmann)', unit_price: 555, option_type: 'remote_kit', price_unit: 'flat', qty_based: false },
  { slug: 'kit_105_spettmann', display_name: 'Kit 105 / 5 Chn Remote & Motor Upgrade (Spettmann)', unit_price: 665, option_type: 'remote_kit', price_unit: 'flat', qty_based: false },
  { slug: 'kit_201_spettmann', display_name: 'Kit 201 / 1 Chn Remote & Motion Sensor + Motor (Spettmann)', unit_price: 495, option_type: 'remote_kit', price_unit: 'flat', qty_based: false },
  { slug: 'kit_202_spettmann', display_name: 'Kit 202 / 5 Chn Remote & 2 Motion Sensors + Motor (Spettmann)', unit_price: 895, option_type: 'remote_kit', price_unit: 'flat', qty_based: false },
  { slug: 'kit_203_spettmann', display_name: 'Kit 203 / 5 Chn Remote & 3 Motion Sensors + Motor (Spettmann)', unit_price: 1295, option_type: 'remote_kit', price_unit: 'flat', qty_based: false },
  { slug: 'kit_204_spettmann', display_name: 'Kit 204 / 5 Chn Remote & 4 Motion Sensors + Motor (Spettmann)', unit_price: 1695, option_type: 'remote_kit', price_unit: 'flat', qty_based: false },
  { slug: 'kit_205_spettmann', display_name: 'Kit 205 / 5 Chn Remote & 5 Motion Sensors + Motor (Spettmann)', unit_price: 1995, option_type: 'remote_kit', price_unit: 'flat', qty_based: false },
  { slug: 'remote_1chn_additional_spettmann', display_name: '1 Chn Additional Remote (Spettmann)', unit_price: 85, option_type: 'remote_kit', price_unit: 'each', qty_based: true },
  { slug: 'remote_5chn_additional_spettmann', display_name: '5 Chn Additional Remote (Spettmann)', unit_price: 95, option_type: 'remote_kit', price_unit: 'each', qty_based: true },
  { slug: 'motion_sensor_spettmann', display_name: 'Motion Sensor Only (Spettmann)', unit_price: 245, option_type: 'remote_kit', price_unit: 'each', qty_based: true },
  { slug: 'kit_301_somfy', display_name: 'Kit 301 / 1 Chn Remote & Motor Upgrade (Somfy)', unit_price: 295, option_type: 'remote_kit', price_unit: 'flat', qty_based: false },
  { slug: 'kit_302_somfy', display_name: 'Kit 302 / 5 Chn Remote & Motor Upgrade (Somfy)', unit_price: 465, option_type: 'remote_kit', price_unit: 'flat', qty_based: false },
  { slug: 'kit_303_somfy', display_name: 'Kit 303 / 5 Chn Remote & Motor Upgrade (Somfy)', unit_price: 635, option_type: 'remote_kit', price_unit: 'flat', qty_based: false },
  { slug: 'kit_304_somfy', display_name: 'Kit 304 / 5 Chn Remote & Motor Upgrade (Somfy)', unit_price: 795, option_type: 'remote_kit', price_unit: 'flat', qty_based: false },
  { slug: 'kit_305_somfy', display_name: 'Kit 305 / 5 Chn Remote & Motor Upgrade (Somfy)', unit_price: 975, option_type: 'remote_kit', price_unit: 'flat', qty_based: false },
  { slug: 'kit_401_somfy', display_name: 'Kit 401 / 1 Chn Remote & Motion Sensor + Motor (Somfy)', unit_price: 765, option_type: 'remote_kit', price_unit: 'flat', qty_based: false },
  { slug: 'kit_402_somfy', display_name: 'Kit 402 / 5 Chn Remote & 2 Motion Sensors + Motor (Somfy)', unit_price: 1395, option_type: 'remote_kit', price_unit: 'flat', qty_based: false },
  { slug: 'kit_403_somfy', display_name: 'Kit 403 / 5 Chn Remote & 3 Motion Sensors + Motor (Somfy)', unit_price: 1995, option_type: 'remote_kit', price_unit: 'flat', qty_based: false },
  { slug: 'kit_404_somfy', display_name: 'Kit 404 / 5 Chn Remote & 4 Motion Sensors + Motor (Somfy)', unit_price: 2695, option_type: 'remote_kit', price_unit: 'flat', qty_based: false },
  { slug: 'kit_405_somfy', display_name: 'Kit 405 / 5 Chn Remote & 5 Motion Sensors + Motor (Somfy)', unit_price: 3195, option_type: 'remote_kit', price_unit: 'flat', qty_based: false },
  { slug: 'remote_1chn_additional_somfy', display_name: '1 Chn Additional Remote (Somfy)', unit_price: 125, option_type: 'remote_kit', price_unit: 'each', qty_based: true },
  { slug: 'remote_5chn_additional_somfy', display_name: '5 Chn Additional Remote (Somfy)', unit_price: 145, option_type: 'remote_kit', price_unit: 'each', qty_based: true },
  { slug: 'motion_sensor_somfy', display_name: 'Motion Sensor Only (Somfy)', unit_price: 345, option_type: 'remote_kit', price_unit: 'each', qty_based: true },
  { slug: 'hub_bond', display_name: 'Smart Hub (Bond)', unit_price: 175, option_type: 'remote_kit', price_unit: 'flat', qty_based: false },
  { slug: 'hub_tac', display_name: 'Smart Hub (TAC)', unit_price: 175, option_type: 'remote_kit', price_unit: 'flat', qty_based: false },
]

// Crank handle
const CRANK_HANDLE = {
  slug: 'crank_handle', display_name: 'Crank Handle', unit_price: 65,
  option_type: 'crank_handle', price_unit: 'flat', qty_based: false,
}

// ─────────────────────────────────────────────────────────────────────────────
// Seeder Class
// ─────────────────────────────────────────────────────────────────────────────
export class CatalogSeeder {
  private catModel = ProductCategoryModel.getInstance()
  private subCatModel = ProductSubCategoryModel.getInstance()
  private productModel = ProductTypeModel.getInstance()
  private priceModel = ProductPriceModel.getInstance()
  private groupModel = OptionGroupModel.getInstance()
  private optionModel = OptionCatalogModel.getInstance()

  public async seed(): Promise<void> {
    console.log('🔄 Checking catalog seeding...')
    try {
      const existing = await this.catModel.getAll({}) as any[]
      const count = Array.isArray(existing) ? existing.length : (existing as any).total ?? 0
      if (count > 0) {
        console.log(`  ✅ Catalog already seeded (${count} categories found), skipping`)
        return
      }

      await this.seedCategories()
      await this.seedSubCategories()
      await this.seedProductTypes()
      await this.seedPrices()
      await this.seedOptionGroups()
      await this.seedOptionCatalog()
      console.log('✅ Catalog seeded successfully')
    } catch (err) {
      console.error('❌ Error seeding catalog:', err)
    }
  }

  private async seedCategories(): Promise<void> {
    for (const cat of CATEGORIES) {
      await this.catModel.create(cat)
    }
    console.log(`  📁 Seeded ${CATEGORIES.length} product categories`)
  }

  private async seedSubCategories(): Promise<void> {
    for (const sub of SUB_CATEGORIES) {
      await this.subCatModel.create(sub)
    }
    console.log(`  📂 Seeded ${SUB_CATEGORIES.length} sub-categories`)
  }

  private async seedProductTypes(): Promise<void> {
    for (const product of PRODUCT_TYPES) {
      await this.productModel.create(product as any)
    }
    console.log(`  🛍  Seeded ${PRODUCT_TYPES.length} product types`)
  }

  private async seedPrices(): Promise<void> {
    const prices = loadPrices()
    let total = 0
    for (const [slug, rows] of Object.entries(prices)) {
      if (rows.length === 0) continue
      const docs = rows.map(r => ({ product_type_slug: slug, width_ft: r.width_ft, projection_ft: r.projection_ft, msrp: r.msrp }))
      // Insert in batches of 500
      for (let i = 0; i < docs.length; i += 500) {
        const batch = docs.slice(i, i + 500)
        await Promise.all(batch.map(d => this.priceModel.create(d as any)))
      }
      total += docs.length
    }
    console.log(`  💰 Seeded ${total} price rows`)
  }

  private async seedOptionGroups(): Promise<void> {
    for (const group of OPTION_GROUPS) {
      await this.groupModel.create(group as any)
    }
    console.log(`  🎛  Seeded ${OPTION_GROUPS.length} option groups`)
  }

  private async seedOptionCatalog(): Promise<void> {
    const items: any[] = []

    // Milan hoods
    for (const [w, p] of milanHoodPrices) {
      items.push({ slug: `milan_hood_${w}ft`, option_type: 'retractable_hood', display_name: `Milan Hood ${w}'`, unit_price: p, price_unit: 'flat', qty_based: false, is_active: true })
    }

    // Drop shade hoods
    for (const [w, p] of dropShadeHoodPrices) {
      items.push({ slug: `drop_shade_hood_${w}ft`, option_type: 'drop_shade_hood', display_name: `Drop Shade Hood ${w}'`, unit_price: p, price_unit: 'flat', qty_based: false, is_active: true })
    }

    // Window awning hoods
    for (const [w, p] of windowAwningHoodPrices) {
      items.push({ slug: `window_awning_hood_${w}ft`, option_type: 'window_awning_hood', display_name: `Window Awning Hood ${w}'`, unit_price: p, price_unit: 'flat', qty_based: false, is_active: true })
    }

    // Remote kits
    for (const kit of REMOTE_KITS) {
      items.push({ ...kit, is_active: true })
    }

    // Crank handle
    items.push({ ...CRANK_HANDLE, is_active: true })

    for (const item of items) {
      await this.optionModel.create(item)
    }
    console.log(`  🔧 Seeded ${items.length} option catalog items`)
  }
}
