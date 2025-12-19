import { BaseService } from '../../common/core/baseService'
import { AppointmentModel } from './appointmentModel'
import { Appointment, GetAppointmentParams, StaffAppointments } from './appointmentInterface'
import { PaginatedResponse } from '../../common/interfaces/globalInterfaces'
import { UserService } from '../user/userService'
import { CreateNotificationParam } from '../notification/notificationInterface'
import { NotificationService } from '../notification/notificationService'
import { LocationService } from '../../services/locationService'
import { ChatService } from '../chat/chatService'
import { DateHelper } from '../../common/utils/dateHelper'
import { AppError } from '../../common/utils/appError'
import { EmailService } from '../../services/emailService'

export class AppointmentService extends BaseService<Appointment> {
  private userService: UserService
  private notificationService: NotificationService
  private locationService: LocationService
  private chatService: ChatService
  private emailService: EmailService
  constructor() {
    super(AppointmentModel.getInstance())
    this.userService = new UserService()
    this.notificationService = new NotificationService()
    this.locationService = new LocationService()
    this.chatService = new ChatService()
    this.emailService = new EmailService()
  }

  // Common function to get populated item data
  private getPopulatedAppointment = async (
    appointmentId: string,
    authUserId?: string
  ): Promise<Appointment | null> => {
    const appointmentModel = this.model.getMongooseModel()
    const appointment = await appointmentModel
      .findById(appointmentId)
      .populate({
        path: 'service',
        select: 'name',
        model: 'Service',
      })
      .populate({
        path: 'staff',
        select: 'name email profilePicture',
        model: 'User',
        populate: {
          path: 'profilePicture',
          select: 'url',
          model: 'Upload',
        },
      })
      .lean()

    // Handle case where appointment doesn't exist
    if (!appointment) {
      console.warn(`Appointment not found: ${appointmentId}`)
      return null
    }

    if (appointment.service) {
      // Return service as object with both id and name
      appointment.service = {
        id: appointment.service._id.toString(),
        name: appointment.service.name,
      }
    }

    if (appointment.staff) {
      // Return staff as object with profile information
      appointment.staff = {
        id: appointment.staff._id.toString(),
        name: appointment.staff.name,
        email: appointment.staff.email,
        ...(appointment.staff.profilePicture?.url && {
          profilePicture: appointment.staff.profilePicture.url,
        }),
      }
    }

    // Get coordinates from address
    try {
      const coordinates = await this.locationService.getCoordinates(
        appointment.address1,
        appointment.address2,
        appointment.city,
        appointment.zipCode
      )

      if (coordinates) {
        appointment.location = coordinates
      }
    } catch (error) {
      console.error('Error getting coordinates:', error)
    }

    // Check if auth user has a chat with the staff
    if (authUserId && appointment.staff && typeof appointment.staff === 'object') {
      const staffId = appointment.staff.id
      try {
        const existingChat = await this.chatService.findExistingChat([authUserId, staffId])
        appointment.chatId = existingChat ? existingChat._id.toString() : null
      } catch (error) {
        console.error('Error finding chat:', error)
        appointment.chatId = null
      }
    } else {
      appointment.chatId = null
    }

    return appointment
  }

  // Create appointment
  public createAppointment = async (payload: Appointment): Promise<Appointment> => {
    const appointment = await this.model.create(payload)
    const populatedAppointment = await this.getPopulatedAppointment(appointment._id)

    if (!populatedAppointment) {
      throw AppError.notFound('Failed to populate created appointment')
    }

    // Create new appointment notification for salesperson (background-task)
    setImmediate(async () => {
      try {
        await this.notificationService.createNotification({
          type: 'New-Appointment',
          refType: 'Appointment',
          refId: appointment._id,
          targets: [appointment.staff],
          data: { appointment: appointment._id },
          sendPush: true,
        })
      } catch (err) {
        console.error('Failed to create notification:', err)
      }
    })

    // Send emails based on notification flags (background-task)
    setImmediate(async () => {
      try {
        console.log('📧 [APPOINTMENT] Starting email sending process...')
        console.log('📧 [APPOINTMENT] Appointment ID:', appointment._id)
        console.log('📧 [APPOINTMENT] Notifications flags:', appointment.notifications)

        const notifications = appointment.notifications || {}

        // Send email to customer if flag is set
        if (notifications.emailToCustomer) {
          console.log('📧 [APPOINTMENT] Email to customer flag is TRUE')
          try {
            await this.emailService.sendAppointmentToCustomer(appointment)
            console.log('📧 [APPOINTMENT] Customer email sent successfully')
          } catch (err) {
            console.error('❌ [APPOINTMENT] Failed to send customer email:', err)
          }
        } else {
          console.log('📧 [APPOINTMENT] Email to customer flag is FALSE or not set')
        }

        // Send email to managers if flag is set
        if (notifications.emailToManager) {
          console.log('📧 [APPOINTMENT] Email to manager flag is TRUE')
          try {
            console.log('📧 [APPOINTMENT] Fetching all managers...')
            const managers = await this.userService.getAllManagers()
            console.log('📧 [APPOINTMENT] Managers fetched:', managers.length)
            console.log(
              '📧 [APPOINTMENT] Manager emails:',
              managers.map(m => m.email)
            )

            const managerEmails = managers.map(manager => manager.email)

            if (managerEmails.length > 0) {
              console.log('📧 [APPOINTMENT] Getting salesperson name...')
              const salesperson = await this.userService.getById(appointment.createdBy.toString())
              console.log('📧 [APPOINTMENT] Salesperson:', salesperson.name)

              console.log('📧 [APPOINTMENT] Sending manager emails...')
              await this.emailService.sendAppointmentToManagers(
                {
                  ...appointment,
                  salespersonName: salesperson.name,
                },
                managerEmails
              )
              console.log(
                `✅ [APPOINTMENT] Manager emails sent to ${managerEmails.length} manager(s)`
              )
            } else {
              console.log('⚠️ [APPOINTMENT] No managers found to notify')
            }
          } catch (err) {
            console.error('❌ [APPOINTMENT] Failed to send manager emails:', err)
          }
        } else {
          console.log('📧 [APPOINTMENT] Email to manager flag is FALSE or not set')
        }
      } catch (err) {
        console.error('❌ [APPOINTMENT] Failed to send appointment emails:', err)
      }
    })

    return populatedAppointment
  }

  // Update appointment
  public updateAppointment = async (
    appointmentId: string,
    payload: Appointment
  ): Promise<Appointment> => {
    const appointment = await this.model.update(appointmentId, payload)
    if (!appointment) {
      throw AppError.notFound('Appointment not found')
    }
    const populatedAppointment = await this.getPopulatedAppointment(appointment._id)
    if (!populatedAppointment) {
      throw AppError.notFound('Failed to populate updated appointment')
    }
    return populatedAppointment
  }

  // Update appointment status only
  public updateAppointmentStatus = async (
    appointmentId: string,
    status: string
  ): Promise<Appointment> => {
    const appointment = await this.model.update(appointmentId, { status })
    if (!appointment) {
      throw AppError.notFound('Appointment not found')
    }
    const populatedAppointment = await this.getPopulatedAppointment(appointment._id)
    if (!populatedAppointment) {
      throw AppError.notFound('Failed to populate updated appointment')
    }
    return populatedAppointment
  }

  // Override getById to accept authUserId
  public getById = async (id: string, authUserId?: string): Promise<Appointment> => {
    const appointment = await this.getPopulatedAppointment(id, authUserId)
    if (!appointment) {
      throw AppError.notFound('Appointment not found')
    }
    return appointment
  }

  // Get all appointment
  public getAllAppointments = async (
    params: GetAppointmentParams,
    userId: string
  ): Promise<Appointment[] | PaginatedResponse<Appointment>> => {
    const { search, today, dateFilter, ...filters } = params
    let query: any = { ...filters }
    const conditions = []

    // Get user data
    const user = await this.userService.getById(userId)

    // Apply role-based filtering only if 'today' is not true
    // When 'today=true', allow viewing all appointments for today regardless of assignment
    if (user.role === 'salesperson' && !today) {
      conditions.push({
        $or: [{ staff: userId }, { createdBy: userId }],
      })
    } else if (user.role === 'salesperson' && today) {
      // Skip role-based filtering when today=true
    }

    // search items
    if (search) {
      const searchRegex = new RegExp(search, 'i')
      conditions.push({
        $or: [
          { email: searchRegex },
          { phoneNumber: searchRegex },
          { businessName: searchRegex },
          { source: searchRegex },
          {
            $expr: {
              $regexMatch: {
                input: { $concat: ['$firstName', ' ', '$lastName'] },
                regex: search,
                options: 'i',
              },
            },
          },
        ],
      })
    }

    if (conditions.length > 0) {
      query.$and = conditions
    }

    // Handle date filtering
    if (today) {
      const startOfDay = DateHelper.getStartOfDay()
      const endOfDay = DateHelper.getEndOfDay()

      query.date = {
        $gte: startOfDay,
        $lt: endOfDay,
      }
    } else if (dateFilter) {
      const startOfDay = DateHelper.getStartOfDay(dateFilter)
      const endOfDay = DateHelper.getEndOfDay(dateFilter)

      query.date = {
        $gte: startOfDay,
        $lt: endOfDay,
      }
    }

    const appointments = await this.model.getAll(query)

    // paginated response
    if (appointments && 'result' in appointments && 'pagination' in appointments) {
      const populatedAppointments = await Promise.all(
        appointments.result
          .filter((appointment: Appointment) => appointment._id) // Remove invalid IDs
          .map((appointment: Appointment) => this.getPopulatedAppointment(appointment._id!))
      )
      // Filter out null results from orphaned/deleted appointments
      const validAppointments = populatedAppointments.filter((a): a is Appointment => a !== null)

      return {
        result: validAppointments,
        pagination: appointments.pagination,
      }
    }

    // non-paginated response
    const nonPaginatedResults = await Promise.all(
      appointments.map((appointment: Appointment) => this.getPopulatedAppointment(appointment._id!))
    )
    // Filter out null results
    return nonPaginatedResults.filter((a): a is Appointment => a !== null)
  }

  // Get appointments for manager/admin
  public getAppointmentsforManager = async (
    params: GetAppointmentParams
  ): Promise<StaffAppointments[]> => {
    const { search, today, dateFilter, staff, ...filters } = params
    let query: any = { ...filters }

    // Apply date filtering if needed
    if (today) {
      const startOfDay = DateHelper.getStartOfDay()
      const endOfDay = DateHelper.getEndOfDay()
      query.date = {
        $gte: startOfDay,
        $lt: endOfDay,
      }
    } else if (dateFilter) {
      const startOfDay = DateHelper.getStartOfDay(dateFilter)
      const endOfDay = DateHelper.getEndOfDay(dateFilter)

      query.date = {
        $gte: startOfDay,
        $lt: endOfDay,
      }
    }

    // Apply search filter if provided
    if (search) {
      const searchRegex = new RegExp(search, 'i')
      query.$or = [
        { email: searchRegex },
        { phoneNumber: searchRegex },
        { businessName: searchRegex },
        { source: searchRegex },
        {
          $expr: {
            $regexMatch: {
              input: { $concat: ['$firstName', ' ', '$lastName'] },
              regex: search,
              options: 'i',
            },
          },
        },
      ]
    }

    if (staff) {
      query.staff = staff
    }

    // Get all appointments with staff populated
    const appointments = await this.model
      .getMongooseModel()
      .find(query)
      .select(
        'customerType firstName lastName source emailAddress address1 address2 city bestContact date time status'
      )
      .populate({
        path: 'staff',
        select: 'name email profilePicture',
        model: 'User',
        populate: {
          path: 'profilePicture',
          select: 'url',
          model: 'Upload',
        },
      })
      .lean()

    // Group appointments by staff
    const staffMap = new Map<string, StaffAppointments>()

    for (const appointment of appointments) {
      if (!appointment.staff) continue

      const staffId = appointment.staff._id.toString()

      const { staff, ...appointmentWithoutStaff } = appointment

      if (!staffMap.has(staffId)) {
        staffMap.set(staffId, {
          staff: {
            _id: staffId,
            name: appointment.staff.name,
            email: appointment.staff.email,
            ...(appointment.staff.profilePicture?.url && {
              profilePicture: appointment.staff.profilePicture.url,
            }),
          },
          appointments: [],
        })
      }

      staffMap.get(staffId)?.appointments.push(appointmentWithoutStaff)
    }

    return Array.from(staffMap.values()).sort((a, b) => a.staff.name.localeCompare(b.staff.name))
  }
}
