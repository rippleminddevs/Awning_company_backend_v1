export class BaseService<T> {
  constructor(protected model: any) {}

  public getAll = async (params: any = {}): Promise<T[]> => {
    return this.model.getAll(params)
  }

  public getOne = async (params: any = {}): Promise<T> => {
    return this.model.getOne(params)
  }

  public getById = async (id: string): Promise<T> => {
    return this.model.getById(id)
  }

  public create = async (data: Partial<T>): Promise<T> => {
    return this.model.create(data)
  }

  public update = async (id: string, data: Partial<T>): Promise<T> => {
    return this.model.update(id, data)
  }

  public delete = async (id: string): Promise<any> => {
    return this.model.delete(id)
  }
}
