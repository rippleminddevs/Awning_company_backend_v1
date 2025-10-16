export interface width_ft {
  min: number
  max: number
}

export interface width_in {
  min: number
  max: number
}

export interface height_ft {
  min: number
  max: number
}

export interface PricingRule {
  condition: string;             
  baseValue: string | number;     
  variationIncrement: number;     
}

export interface Pricing {
  basePrice: number;              
  finalPrice: number;             
  rules: PricingRule[];           
}

export interface Product {
  type: string
  name: string
  colors: string[]
  installation: string
  hood: string
  description: string
  width_fraction: string
  width_ft: width_ft
  width_in: width_in
  height_ft: height_ft
  image?: string
  pricing: Pricing
  createdBy: string
}

export interface GetProductsParams {
  type?: string
}

export interface SearchProductsParams {
  name?: string
}