import { BaseService } from '../../common/core/baseService'
import { CustomerModel } from './customerModel'
import { Customer, CustomerResponse } from './customerInterface'

export class CustomerService extends BaseService<Customer> {
  constructor() {
    super(CustomerModel.getInstance())
  }

  private populateService = async (id: string) => {
    let customer = await this.model.getMongooseModel()
        .findById(id)
        .populate({
            path: 'serviceRequested',
            select: 'name',
            model: 'Service'
        })
        .lean()

    if (customer && customer.serviceRequested) {
        customer = {
            ...customer,
            serviceRequested: customer.serviceRequested.name
        };
    }
    return customer;
}

  public createCustomer = async (customer: Customer): Promise<CustomerResponse> => {
    const createdCustomer = await this.model.create(customer)
    return await this.populateService(createdCustomer._id)
  }

  public updateCustomer = async (customer: Customer, id: string): Promise<CustomerResponse> => {
    const updatedCustomer = await this.model.update(id, customer)
    return await this.populateService(updatedCustomer._id)
  }

  public deleteCustomer = async (id: string): Promise<CustomerResponse> => {
    return this.model.delete(id)
  }
}