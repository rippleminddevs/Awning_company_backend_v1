export interface notifications {
  emailToCustomer?: boolean
  emailToManager?: boolean
  textMessages?: boolean
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
  service: string
  staff: string
  date: Date | string
  time: Date | string
  duration: string
  status: string
  internalNotes?: string
  notifications?: notifications
  phoneNumber?: string
  createdBy: string
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
    _id: string;
    name: string;
    profilePicture?: string;
    email: string;
  };
  appointments: Appointment[];
}