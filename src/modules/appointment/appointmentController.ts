import { BaseController } from '../../common/core/baseController'
import { AppointmentService } from './appointmentService'
import { Appointment, GetAppointmentParams } from './appointmentInterface'
import { apiResponse } from '../../common/utils/apiResponse'
import { Request, Response } from 'express'

export class AppointmentController extends BaseController<Appointment, AppointmentService> {
  constructor(appointmentService: AppointmentService) {
    super(appointmentService)
  }

  public create = async(req: Request, res: Response):Promise<void> => {
    const data = {
      ...req.body,
      createdBy: req.user!.id
    }
    const appointment = await this.service.createAppointment(data)
    apiResponse(res, appointment, 201, "Appointment created successfully")
  }

  public update = async(req: Request, res: Response):Promise<void> => {
    const data = {
      ...req.body,
      createdBy: req.user!.id
    }
    const appointment = await this.service.updateAppointment(req.params.id, data)
    apiResponse(res, appointment, 200, "Appointment updated successfully")
  }

  public delete = async(req: Request, res: Response):Promise<void> => {
    const appointment = await this.service.delete(req.params.id)
    apiResponse(res, appointment, 200, "Appointment deleted successfully")
  }

  public getById = async(req: Request, res: Response):Promise<void> => {
    const appointment = await this.service.getById(req.params.id)
    apiResponse(res, appointment, 200, "Appointment fetched successfully")
  }

  public getAll = async(req: Request, res: Response):Promise<void> => {
    const params = req.query as GetAppointmentParams
    const appointment = await this.service.getAllAppointments(params, req.user!.id)
    apiResponse(res, appointment, 200, "Appointments fetched successfully")
  }

  public getAppointmentsforManager = async(req: Request, res: Response):Promise<void> => {
    const params = req.query as GetAppointmentParams
    const appointment = await this.service.getAppointmentsforManager(params)
    apiResponse(res, appointment, 200, "Appointments fetched successfully")
  }
}
