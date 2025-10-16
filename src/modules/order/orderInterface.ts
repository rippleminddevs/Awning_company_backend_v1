export interface location {
  latitude: number
  longitude: number
  address: string
}

export interface AdditionalFeatures {
  handheldRemote?: string
  motionSensor?: string
  ledLight?: string
  smartHub?: string
  variValance?: string
  variPitch?: string
  hood?: string
  crankHandleLength?: string
  customRoofBracket?: string
  quantity?: number
  furring_ft?: number
  spacers_ft?: number
  wedges?: number
  conduit?: number
  additionalCost?: string
  additionalCostAmount?: number
  instructions?: string
  ceilingLights?: string
  ceilingFanBeam?: string
  ceilingFanInstall?: string
  steelForPost?: string
  steelForHeader?: string
  footings?: string
  rafterCut?: string
  doubleRaterBeams?: string
  doubleHeaderBeams?: string
  powerOutlet?: string
  custom?: string
}

export interface Order {
  _id: any
  awningType: string;
  product: string;
  quoteId: string
  custom?: string
  operation?: string
  productName?: string
  hardwareColor?: string
  roofColor?: string
  bays?: string
  unitSize?: string
  width_ft?: number
  width_in?: number
  widthFraction?: string
  height_ft?: number
  height_in?: number
  heightFraction?: string
  projection_ft?: number
  projection_in?: number
  projectionFraction?: string
  projection?: string
  picketSize?: string
  picketSpacing?: string
  crank?: string
  motorized?: string
  fabric?: string
  fabricTab?: string
  magnetLatch?: string
  quantity?: number
  valancaHeight?: string
  valancaStyle?: string
  bindingColor?: string
  installation?: string
  story?: string
  description?: string
  frameUpgrade?: string
  frameUpgradePercentage?: string
  post2?: string
  post2Percentage?: string
  post3?: string
  post3Percentage?: string
  post4?: string
  post4Percentage?: string
  location?: location
  additionalFeatures?: AdditionalFeatures
  unitPrice?: number
  createdBy: string
}