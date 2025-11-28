export interface Customer {
  _id?: string
  name: string
  emailAddress: string
  phone: string
  address: string
  city: string
  zipCode: string
  notes?: string
  source: string
  serviceRequested: string
  createdBy: string
}

export interface CustomerResponse {
  _id?: string
  name: string
  emailAddress: string
  phone: string
  address: string
  city: string
  zipCode: string
  notes?: string
  source: string
  serviceRequested: string
  createdBy?: string
  createdAt?: Date
  updatedAt?: Date
}
