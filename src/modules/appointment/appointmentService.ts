import { BaseService } from '../../common/core/baseService'
import { AppointmentModel } from './appointmentModel'
import { Appointment, GetAppointmentParams, StaffAppointments } from './appointmentInterface'
import { PaginatedResponse } from '../../common/interfaces/globalInterfaces'
import { UserService } from '../user/userService'
import { CreateNotificationParam } from '../notification/notificationInterface'
import { NotificationService } from '../notification/notificationService'

export class AppointmentService extends BaseService<Appointment> {
  private userService: UserService
  private notificationService: NotificationService
  constructor() {
    super(AppointmentModel.getInstance())
    this.userService = new UserService()
    this.notificationService = new NotificationService()
  }

    // Common function to get populated item data
    private getPopulatedAppointment = async (appointmentId: string): Promise<Appointment> => {
      const appointmentModel = this.model.getMongooseModel();
      const appointment = await appointmentModel.findById(appointmentId)
        .populate({
          path: 'service',
          select: 'name',
          model: 'Service'
        })
        .populate({
          path: 'staff',
          select: 'name',
          model: 'User'
        })
        .lean();

      if (appointment.service) {
        appointment.service = appointment.service.name;
      }

      if (appointment.staff) {
        appointment.staff = appointment.staff.name;
      }

      return appointment;
    }

    // Create appointment
    public createAppointment = async (payload: Appointment): Promise<Appointment> => {
      const appointment = await this.model.create(payload)
      const populatedAppointment = this.getPopulatedAppointment(appointment._id)

      // Create new appointment notification for salesperson (background-task)
      setImmediate(async () => {
        try {
          await this.notificationService.createNotification({
            type: 'New-Appointment',
            refType: 'Appointment',
            refId: appointment._id,
            targets: [appointment.staff],
            data: { appointment: appointment._id }
          });
        } catch (err) {
          console.error('Failed to create notification:', err);
        }
      });      

      return populatedAppointment
    }

    // Update appointment
    public updateAppointment = async (appointmentId: string, payload: Appointment): Promise<Appointment> => {
      const appointment = await this.model.update(appointmentId, payload)
      return this.getPopulatedAppointment(appointment._id)
    }

    // Get all appointment
    public getAllAppointments = async (params: GetAppointmentParams, userId: string): Promise<Appointment[] | PaginatedResponse<Appointment>> => {
      const {
        search,
        today,
        dateFilter,
        ...filters
      } = params;
      let query: any = { ...filters };

      // Get user data
      const user = await this.userService.getById(userId)
      if(user.role === 'salesperson') {
       query.staff = userId
      }

      // Handle date filtering
      if (today) {
        const todayUTC = new Date();
        todayUTC.setUTCHours(0, 0, 0, 0);
      
        const tomorrowUTC = new Date(todayUTC);
        tomorrowUTC.setUTCDate(todayUTC.getUTCDate() + 1);
        query.date = {
          $gte: todayUTC,
          $lt: tomorrowUTC
        };
      } else if (dateFilter) {
        const filterDate = new Date(dateFilter);
        filterDate.setUTCHours(0, 0, 0, 0);
      
        const nextDay = new Date(filterDate);
        nextDay.setUTCDate(filterDate.getUTCDate() + 1);
      
        query.date = {
          $gte: filterDate,
          $lt: nextDay
        };
      }
      
      // search items
      if (search) {
        const searchRegex = new RegExp(search, 'i');
        query.$or = [
          { email: searchRegex },
          { phoneNumber: searchRegex },
          {businessName: searchRegex},
          {source: searchRegex},
          { 
            $expr: {
              $regexMatch: {
                input: { $concat: ['$firstName', ' ', '$lastName'] },
                regex: search,
                options: 'i'
              }
            }
          }
        ];
      }
  
      const appointments = await this.model.getAll(query);
  
      // paginated response
      if (appointments && 'result' in appointments && 'pagination' in appointments) {
        const populatedAppointments = await Promise.all(
          appointments.result.map((appointment: Appointment) => this.getPopulatedAppointment(appointment._id!))
        );
  
        return {
          result: populatedAppointments,
          pagination: appointments.pagination
        };
      }
  
      // non-paginated response
      return Promise.all(
        appointments.map((appointment: Appointment) => this.getPopulatedAppointment(appointment._id!))
      );
    }

    // Get appointments for manager/admin
    public getAppointmentsforManager = async (
      params: GetAppointmentParams
    ): Promise<StaffAppointments[]> => {
      const { search, today, dateFilter, staff, ...filters } = params;
      let query: any = { ...filters };
    
      // Apply date filtering if needed
      if (today) {
        const todayUTC = new Date();
        todayUTC.setUTCHours(0, 0, 0, 0);
      
        const tomorrowUTC = new Date(todayUTC);
        tomorrowUTC.setUTCDate(todayUTC.getUTCDate() + 1);
        query.date = {
          $gte: todayUTC,
          $lt: tomorrowUTC
        };
      } else if (dateFilter) {
        const filterDate = new Date(dateFilter);
        filterDate.setUTCHours(0, 0, 0, 0);
      
        const nextDay = new Date(filterDate);
        nextDay.setUTCDate(filterDate.getUTCDate() + 1);
      
        query.date = {
          $gte: filterDate,
          $lt: nextDay
        };
      }
    
      // Apply search filter if provided
      if (search) {
        const searchRegex = new RegExp(search, 'i');
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
                options: 'i'
              }
            }
          }
        ];
      }

      if (staff) {
        query.staff = staff;
      }

      // Get all appointments with staff populated
      const appointments = await this.model.getMongooseModel().find(query)
      .select('customerType firstName lastName source emailAddress address1 address2 city bestContact date time status')
        .populate({
          path: 'staff',
          select: 'name email profilePicture',
          model: 'User',
          populate:{
            path: 'profilePicture',
            select: 'url',
            model: 'Upload'
          }
        })
        .lean();
    
      // Group appointments by staff
      const staffMap = new Map<string, StaffAppointments>();
    
      for (const appointment of appointments) {
        if (!appointment.staff) continue;
        
        const staffId = appointment.staff._id.toString();
        
        const { staff, ...appointmentWithoutStaff } = appointment;
        
        if (!staffMap.has(staffId)) {
          staffMap.set(staffId, {
            staff: {
              _id: staffId,
              name: appointment.staff.name,
              email: appointment.staff.email,
              ...(appointment.staff.profilePicture?.url && { 
                profilePicture: appointment.staff.profilePicture.url 
              })
            },
            appointments: []
          });
        }
      
        staffMap.get(staffId)?.appointments.push(appointmentWithoutStaff);
      }
    
      return Array.from(staffMap.values()).sort((a, b) => 
        a.staff.name.localeCompare(b.staff.name)
      );
    };
}