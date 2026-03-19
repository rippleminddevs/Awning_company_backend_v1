export interface Service {
  name: string
  createdBy: string
}

export interface ServiceResponse {
  _id: string
  name: string
  createdBy: {
    _id: string
    name: string
    role: string
  }
  createdAt: string
  updatedAt: string
}