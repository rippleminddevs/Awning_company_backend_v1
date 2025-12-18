export interface Location {
  address?: string
  latitude: number
  longitude: number
}

export interface User {
  _id: string
  name: string
  email: string
  password?: string
  googleId?: string
  facebookId?: string
  deviceTokens?: string[]
  location?: Location
  profilePicture?: string
  phoneNumber?: string
  role?: 'salesperson' | 'manager' | 'superadmin'
  isAdmin?: boolean
  isVerified: boolean
  city?: string
  zipCode?: string
  permissions?: {
    salesTracking?: boolean
    orderTracking?: boolean
    staffPerformance?: boolean
  }
}

export interface UserResponse {
  _id: string
  name: string
  email: string
  password?: string
  googleId?: string
  facebookId?: string
  deviceTokens?: string[]
  location?: Location
  profilePicture?: string
  phoneNumber?: string
  role?: 'salesperson' | 'manager' | 'superadmin'
  isAdmin?: boolean
  isVerified: boolean
  customersAssigned?: number
  permissions?: any
  city?: string
  zipCode?: string
}

export interface UserUpdate {
  name?: string
  email?: string
  password?: string
  location?: Location
  profilePicture?: string
  phoneNumber?: string
  role?: 'salesperson' | 'manager' | 'superadmin'
  googleId?: string
  facebookId?: string
  deviceTokens?: string[]
  isAdmin?: boolean
  isVerified?: boolean
  city?: string
  zipCode?: string
}

export interface UpdateFCMTokens {
  userId: string
  addfcmToken?: string
  removefcmToken?: string
}

export interface GetSalesPersonsParams {
  paginate?: number
  page?: number
  perPage?: number
  search?: string
  duration?: 'daily' | 'weekly' | 'monthly' | 'yearly'
}

export interface UserPermissions {
  salesTracking?: boolean
  orderTracking?: boolean
  staffPerformance?: boolean
  _id?: string
}

export interface UpdatePermissions {
  salesTracking?: boolean
  orderTracking?: boolean
  staffPerformance?: boolean
}
