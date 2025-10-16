import { BaseController } from '../../common/core/baseController'
import { CustomerService } from './customerService'
import { Customer, CustomerResponse } from './customerInterface'
import { Request, Response } from 'express'
import { apiResponse } from '../../common/utils/apiResponse'

export class CustomerController extends BaseController<Customer, CustomerService> {
  constructor(customerService: CustomerService) {
    super(customerService)
  }

  public create = async (req: Request, res: Response): Promise<void> => {
    const customer: Customer = {
      ...req.body,
      createdBy: req.user!.id,
    }
    const createdCustomer: CustomerResponse = await this.service.createCustomer(customer)
    apiResponse(res, createdCustomer, 201, "Customer created successfully")
  }

  public update = async (req: Request, res: Response): Promise<void> => {
    const customer: Customer = {
      ...req.body,
      createdBy: req.user!.id,
    }
    const updatedCustomer: CustomerResponse = await this.service.updateCustomer(customer, req.params.id)
    apiResponse(res, updatedCustomer, 200, "Customer updated successfully")
  }

  public delete = async (req: Request, res: Response): Promise<void> => {
    const deletedCustomer: CustomerResponse = await this.service.deleteCustomer(req.params.id)
    apiResponse(res, deletedCustomer, 200, "Customer deleted successfully")
  }
}
