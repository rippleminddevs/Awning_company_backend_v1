export interface notifications {
  emailToCustomer?: boolean
  emailToManager?: boolean
  textMessages?: boolean
}

export interface ServiceInfo {
  id: string
  name: string
}

export interface StaffInfo {
  id: string
  name: string
  email: string
  profilePicture?: string
}

export interface LocationCoordinates {
  latitude: number
  longitude: number
}

export interface Appointment {
  _id?: string
  customerType: string
  firstName?: string
  lastName?: string
  businessName?: string
  billAddress?: string
  projectManagerContact?: string
  companyContact?: string
  source?: string
  emailAddress: string
  address1: string
  address2: string
  city: string
  zipCode: string
  bestContact: string
  customerNotes?: string
  service: string | ServiceInfo
  staff: string | StaffInfo
  date: Date | string
  time: Date | string
  duration: string
  status: string
  internalNotes?: string
  notifications?: notifications
  phoneNumber?: string
  createdBy: string
  location?: LocationCoordinates
}

export interface GetAppointmentParams {
  paginate?: boolean
  page?: number
  perPage?: number
  search?: string
  today?: boolean
  dateFilter?: string
  staff?: string
}

export interface StaffAppointments {
  staff: {
    _id: string
    name: string
    profilePicture?: string
    email: string
  }
  appointments: Appointment[]
}
