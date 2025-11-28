import { BaseService } from '../../common/core/baseService'
import { CustomerModel } from './customerModel'
import { Customer, CustomerResponse } from './customerInterface'
import { PaginatedResponse } from '../../common/interfaces/globalInterfaces'

export class CustomerService extends BaseService<Customer> {
  constructor() {
    super(CustomerModel.getInstance())
  }

  private populateService = async (id: string) => {
    let customer = await this.model
      .getMongooseModel()
      .findById(id)
      .populate({
        path: 'serviceRequested',
        select: 'name',
        model: 'Service',
      })
      .lean()

    if (customer && customer.serviceRequested) {
      customer = {
        ...customer,
        serviceRequested: customer.serviceRequested.name,
      }
    }
    return customer
  }

  private populateAllCustomers = async (customers: Customer[]) => {
    return await Promise.all(
      customers.map(async (customer: Customer) => {
        if (!customer._id) {
          return customer as any
        }
        return await this.populateService(customer._id)
      })
    )
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

  // Get all customers with optional date filtering (MTD/YTD)
  public getAllCustomers = async (
    params: any = {}
  ): Promise<CustomerResponse[] | PaginatedResponse<CustomerResponse>> => {
    const { search, dateFilter, paginate, page, perPage } = params
    let query: any = {}

    // Apply search filter
    if (search) {
      const searchRegex = new RegExp(search, 'i')
      query.$or = [
        { name: { $regex: searchRegex } },
        { emailAddress: { $regex: searchRegex } },
        { phone: { $regex: searchRegex } },
        { address: { $regex: searchRegex } },
        { city: { $regex: searchRegex } },
      ]
    }

    // Apply date filter for MTD (Month-to-Date) or YTD (Year-to-Date)
    if (dateFilter === 'MTD') {
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      query.createdAt = { $gte: startOfMonth, $lte: now }
    } else if (dateFilter === 'YTD') {
      const now = new Date()
      const startOfYear = new Date(now.getFullYear(), 0, 1)
      query.createdAt = { $gte: startOfYear, $lte: now }
    }

    // Get customers from base service
    const customers = await this.model.getAll(query, paginate, page, perPage)

    // Handle paginated response
    if (customers && 'result' in customers && 'pagination' in customers) {
      const populatedCustomers = await this.populateAllCustomers(customers.result)

      return {
        result: populatedCustomers,
        pagination: customers.pagination,
      }
    }

    // Handle non-paginated response
    const result = await this.populateAllCustomers(customers as Customer[])
    return result
  }
}
