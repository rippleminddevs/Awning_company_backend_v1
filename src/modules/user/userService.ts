import { BaseService } from '../../common/core/baseService'
import { AppError } from '../../common/utils/appError'
import {
  GetSalesPersonsParams,
  UpdateFCMTokens,
  User,
  UserResponse,
  UserUpdate,
  UpdatePermissions,
} from './userInterface'
import { UserModel } from './userModel'
import { UploadService } from '../upload/uploadService'
import { LocationService } from '../../services/locationService'
import { EmailService } from '../../services/emailService'
import bcrypt from 'bcryptjs'
import { PaginatedResponse } from '../../common/interfaces/globalInterfaces'
import { AppointmentModel } from '../appointment/appointmentModel'
import { QuoteModel } from '../quote/quoteModel'
import moment from 'moment'

export class UserService extends BaseService<User> {
  private uploadService: UploadService
  private locationService: LocationService
  private appointmentModel: AppointmentModel
  private quoteModel: QuoteModel
  private emailService: EmailService
  constructor() {
    super(UserModel.getInstance())
    this.uploadService = new UploadService()
    this.locationService = new LocationService()
    this.appointmentModel = AppointmentModel.getInstance()
    this.quoteModel = QuoteModel.getInstance()
    this.emailService = new EmailService()
  }

  // common function to populated user data
  private getPopulatedUser = async (userId: string): Promise<UserResponse> => {
    const userModel = this.model.getMongooseModel()
    const user = await userModel
      .findById(userId)
      .populate({
        path: 'profilePicture',
        select: 'url',
      })
      .lean()

    if (user.profilePicture) {
      user.profilePicture = user.profilePicture.url || null
    }

    delete user.password

    // Ensure consistent response structure - add missing fields as null
    // Default permissions object if not present
    const defaultPermissions = {
      salesTracking: false,
      orderTracking: false,
      staffPerformance: false,
    }

    // If permissions exist but are missing some fields, merge with defaults
    let permissions = defaultPermissions
    if (user.permissions) {
      permissions = {
        ...defaultPermissions,
        ...user.permissions,
      }
    }

    return {
      _id: user._id?.toString(),
      name: user.name || '',
      email: user.email || '',
      deviceTokens: user.deviceTokens || [],
      profilePicture: user.profilePicture || null,
      phoneNumber: user.phoneNumber || null,
      location: user.location || null,
      isVerified: user.isVerified || false,
      role: user.role || 'salesperson',
      isAdmin: user.isAdmin || false,
      customersAssigned: user.customersAssigned || 0,
      permissions,
      city: user.city || null,
      zipCode: user.zipCode || null,
      // Include any other fields that might be missing
      googleId: user.googleId || null,
      facebookId: user.facebookId || null,
    }
  }

  // generate plain password for user
  private generatePassword = (): string => {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    const lowercase = 'abcdefghijklmnopqrstuvwxyz'
    const numbers = '0123456789'
    const specials = '!@#$%^&*()_+~`|}{[]\\:;?><,./-='

    // Ensure at least one of each required character type
    const randomUppercase = uppercase[Math.floor(Math.random() * uppercase.length)]
    const randomLowercase = lowercase[Math.floor(Math.random() * lowercase.length)]
    const randomNumber = numbers[Math.floor(Math.random() * numbers.length)]
    const randomSpecial = specials[Math.floor(Math.random() * specials.length)]

    const allChars = uppercase + lowercase + numbers + specials
    const remainingLength = 4
    let remaining = ''
    for (let i = 0; i < remainingLength; i++) {
      remaining += allChars[Math.floor(Math.random() * allChars.length)]
    }

    const passwordChars = [
      randomUppercase,
      randomLowercase,
      randomNumber,
      randomSpecial,
      ...remaining,
    ]
    const password = passwordChars.join('')
    return password
  }

  // Create user
  public createUser = async (data: User): Promise<User> => {
    try {
      if (data.profilePicture) {
        const upload = await this.uploadService.create({
          file: data.profilePicture,
          userId: data._id,
        })

        data.profilePicture = upload._id
      }

      let plainPassword = ''
      if (!data.password) {
        plainPassword = await this.generatePassword()
        data.password = plainPassword
      } else {
        plainPassword = data.password
      }

      const hashedPassword = await bcrypt.hash(data.password, 10)
      data.password = hashedPassword
      data.isVerified = true

      const user = await this.model.create(data)

      // Send welcome email with password
      try {
        await this.emailService.sendWelcomeEmailWithPassword(
          data.email,
          data.name,
          data.email,
          plainPassword
        )
        console.log(`✅ Welcome email sent to user: ${data.email}`)
      } catch (emailError) {
        // Log error but don't fail user creation
        console.error(`❌ Failed to send welcome email to ${data.email}:`, emailError)
      }

      return this.getPopulatedUser(user._id)
    } catch (error: any) {
      // Handle duplicate email error
      if (error.code === 11000 && error.keyPattern?.email) {
        throw AppError.badRequest(
          'A user with this email address already exists. Please use a different email.'
        )
      }
      // Re-throw other errors
      throw error
    }
  }

  // Update user info
  public updateUser = async (id: string, data: UserUpdate): Promise<User> => {
    const existingUser = await this.model.getById(id)
    if (!existingUser) {
      throw AppError.notFound('User not found')
    }

    if (data.profilePicture) {
      const upload = await this.uploadService.create({
        file: data.profilePicture,
        userId: id,
      })

      data.profilePicture = upload._id
    }

    if (data.location?.latitude && data.location?.longitude) {
      // Only geocode if address is not provided in the payload
      if (!data.location.address) {
        try {
          const locationData = await this.locationService.getFullAddress(
            data.location.latitude,
            data.location.longitude
          )
          data.location = {
            ...data.location,
            address: locationData || '',
          }
        } catch (error: any) {
          throw AppError.badRequest(error.message)
        }
      }
    }

    const user = await this.model.update(id, data)
    return this.getPopulatedUser(user._id)
  }

  // Update own profile info
  public updateOwnProfile = async (id: string, data: UserUpdate): Promise<User> => {
    const existingUser = await this.model.getById(id)
    if (!existingUser) {
      throw AppError.notFound('User not found')
    }

    if (data.profilePicture) {
      const upload = await this.uploadService.create({
        file: data.profilePicture,
        userId: id,
      })

      data.profilePicture = upload._id
    }

    if (data.location?.latitude && data.location?.longitude) {
      // Only geocode if address is not provided in the payload
      if (!data.location.address) {
        try {
          const locationData = await this.locationService.getFullAddress(
            data.location.latitude,
            data.location.longitude
          )
          data.location = {
            ...data.location,
            address: locationData || '',
          }
        } catch (error: any) {
          throw AppError.badRequest(error.message)
        }
      }
    }

    const user = await this.model.update(id, data)
    return this.getPopulatedUser(user._id)
  }

  // Update tokens
  public async updateFCMTokens(params: UpdateFCMTokens): Promise<User> {
    const { userId, addfcmToken, removefcmToken } = params
    if (!userId) {
      throw AppError.badRequest('User ID is required')
    }

    const updateFields: any = {}

    if (addfcmToken) {
      updateFields.$addToSet = { deviceTokens: addfcmToken }
    }
    if (removefcmToken) {
      updateFields.$pull = { deviceTokens: removefcmToken }
    }

    if (Object.keys(updateFields).length === 0) {
      throw AppError.badRequest('No FCM token operation specified')
    }

    const mongooseModel = this.model.getMongooseModel()
    const updatedUser = await mongooseModel
      .findByIdAndUpdate(userId, updateFields, { new: true })
      .lean()

    if (!updatedUser) {
      throw AppError.notFound('User not found')
    }

    return updatedUser
  }

  // Get user by id
  public getUserById = async (id: string): Promise<User> => {
    const user = await this.model.getById(id)
    if (!user) {
      throw AppError.notFound('User not found')
    }
    return this.getPopulatedUser(user._id)
  }

  // Get user permissions
  public getPermissions = async (id: string): Promise<any> => {
    const user = await this.model.getById(id)
    if (!user) {
      throw AppError.notFound('User not found')
    }

    const defaultPermissions = {
      salesTracking: false,
      orderTracking: false,
      staffPerformance: false,
    }

    if (user.permissions) {
      return {
        ...defaultPermissions,
        ...user.permissions,
      }
    }

    return defaultPermissions
  }

  // Update user permissions
  public updatePermissions = async (id: string, data: UpdatePermissions): Promise<any> => {
    const user = await this.model.getById(id)
    if (!user) {
      throw AppError.notFound('User not found')
    }

    const defaultPermissions = {
      salesTracking: false,
      orderTracking: false,
      staffPerformance: false,
    }

    // Start with default permissions
    const currentPermissions = user.permissions || defaultPermissions

    // Merge: defaults -> current -> new data (new data wins)
    const updatedPermissions: any = {
      salesTracking:
        data.salesTracking !== undefined
          ? data.salesTracking
          : currentPermissions.salesTracking || defaultPermissions.salesTracking,
      orderTracking:
        data.orderTracking !== undefined
          ? data.orderTracking
          : currentPermissions.orderTracking || defaultPermissions.orderTracking,
      staffPerformance:
        data.staffPerformance !== undefined
          ? data.staffPerformance
          : currentPermissions.staffPerformance || defaultPermissions.staffPerformance,
    }

    const updatedUser = await this.model.update(id, { permissions: updatedPermissions })
    return this.getPopulatedUser(updatedUser._id)
  }

  // Get all users with populated profile pictures
  public getAllUsers = async (
    params: any = {}
  ): Promise<UserResponse[] | PaginatedResponse<UserResponse>> => {
    const { search, city, role, ...restParams } = params
    let query: any = { ...restParams }

    // Search filter for user name
    if (search) {
      query.name = { $regex: search, $options: 'i' }
    }

    // City filter - checks if city field contains the city
    if (city) {
      query.city = { $regex: city, $options: 'i' }
    }

    // Role filter
    if (role) {
      query.role = role
    }

    const users = await this.model.getAll(query)

    // Handle pagination case
    if (users && 'result' in users && 'pagination' in users) {
      const populatedUsers = await Promise.all(
        users.result.map(async (user: User) => {
          return await this.getPopulatedUser(user._id)
        })
      )

      return {
        result: populatedUsers,
        pagination: users.pagination,
      }
    }

    // Handle non-paginated case
    const result = await Promise.all(
      users.map(async (user: User) => {
        return await this.getPopulatedUser(user._id)
      })
    )

    return result
  }

  // Get sales persons
  public getSalesPersons = async (
    params: GetSalesPersonsParams
  ): Promise<UserResponse[] | PaginatedResponse<UserResponse>> => {
    const { search, duration, ...restParams } = params
    let query: any = { ...restParams }
    query.role = 'salesperson'

    // Search filter
    if (search) {
      query = {
        ...query,
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ],
      }
    }

    const users = await this.model.getAll(query)

    // Get date range based on duration
    const dateRange = this.getDateRange(duration)

    // Handle pagination case
    if (users && 'result' in users && 'pagination' in users) {
      const populatedUsers = await Promise.all(
        users.result.map(async (user: User) => {
          const populated = await this.getPopulatedUser(user._id)

          // Count appointments assigned to this specific salesperson
          const customerCounts = await this.appointmentModel.count({
            staff: user._id,
            ...(dateRange && { createdAt: dateRange }),
          })

          const quotedTotal = await this.calculateTotalByStatus(user._id, 'Quoted', dateRange)
          const soldTotal = await this.calculateTotalByStatus(user._id, 'Sold', dateRange)

          return {
            ...populated,
            customersAssigned: customerCounts,
            quotedAmountTotal: quotedTotal,
            soldAmountTotal: soldTotal,
          }
        })
      )

      return {
        result: populatedUsers,
        pagination: users.pagination,
      }
    }

    // Handle non-paginated case
    const result = await Promise.all(
      users.map(async (user: User) => {
        const populated = await this.getPopulatedUser(user._id)

        // Count appointments assigned to this specific salesperson
        const customerCounts = await this.appointmentModel.count({
          staff: user._id,
          ...(dateRange && { createdAt: dateRange }),
        })

        const quotedTotal = await this.calculateTotalByStatus(user._id, 'Quoted', dateRange)
        const soldTotal = await this.calculateTotalByStatus(user._id, 'Sold', dateRange)

        return {
          ...populated,
          customersAssigned: customerCounts,
          quotedAmountTotal: quotedTotal,
          soldAmountTotal: soldTotal,
        }
      })
    )

    return result
  }

  // Private helper to calculate totals by status
  private async calculateTotalByStatus(
    staffId: string,
    status: string,
    dateRange?: { $gte: Date } | null
  ): Promise<number> {
    // Build appointment query
    const appointmentQuery: any = { staff: staffId, status }
    if (dateRange) {
      appointmentQuery.createdAt = dateRange
    }

    // Fetch appointments for this salesperson
    const appointments = await this.appointmentModel.getAll(appointmentQuery)

    const appointmentList = Array.isArray(appointments) ? appointments : appointments.result || []

    const appointmentIds = appointmentList.map((a: any) => a._id)
    if (appointmentIds.length === 0) return 0

    // Build quote query
    const quoteQuery: any = { appointmentId: { $in: appointmentIds } }
    if (dateRange) {
      quoteQuery.createdAt = dateRange
    }

    // Fetch related quotes
    const quotes = await this.quoteModel.getAll(quoteQuery)

    const quoteList = Array.isArray(quotes) ? quotes : quotes.result || []

    // Sum totals
    const total = quoteList.reduce(
      (sum: number, q: any) => sum + (q.paymentStructure?.grandTotal || 0),
      0
    )

    return total
  }

  // private helper to get date range
  private getDateRange(duration?: string): { $gte: Date } | null {
    if (!duration) return null

    const now = new Date()
    let startDate: Date

    switch (duration) {
      case 'daily':
        startDate = moment().startOf('day').toDate()
        break
      case 'weekly':
        startDate = moment().subtract(7, 'days').startOf('day').toDate()
        break
      case 'monthly':
        startDate = moment().subtract(30, 'days').startOf('day').toDate()
        break
      case 'yearly':
        startDate = moment().subtract(1, 'year').startOf('day').toDate()
        break
      default:
        return null
    }

    return { $gte: startDate }
  }

  // Get all managers
  public getAllManagers = async (): Promise<UserResponse[]> => {
    try {
      const users = await this.model.getAll({ role: 'manager' })

      // Handle both paginated and non-paginated responses
      const userList = Array.isArray(users) ? users : users.result || []

      const populatedUsers = await Promise.all(
        userList.map(async (user: User) => {
          return await this.getPopulatedUser(user._id)
        })
      )

      return populatedUsers
    } catch (error: any) {
      console.error('Error fetching managers:', error)
      throw new AppError('Failed to fetch managers', 500)
    }
  }
}
