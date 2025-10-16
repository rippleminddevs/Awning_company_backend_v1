import mongoose, {
  Model,
  Document,
  UpdateQuery,
  PipelineStage,
  Schema,
  isValidObjectId,
} from 'mongoose'
import { Model as SequelizeModel, ModelStatic, Transaction, QueryTypes } from 'sequelize'
import { DatabaseService } from '../../services/databaseService'
import { config } from '../../services/configService'
import { createMongooseSchema } from '../utils/schemaUtils'
import { createSequelizeAttributes } from '../../common/utils/sequelizeUtils'
import { FieldsConfig } from '../interfaces/fieldTypes'
import {
  DEFAULT_PAGINATION_OPTIONS,
  PaginatedResponse,
  PaginationMeta,
} from '../interfaces/globalInterfaces'
import { buildPaginationMeta } from '../utils/helpers'

export class BaseModel<T extends Record<string, any>, M extends Document = Document> {
  private mongooseModel: Model<T & M> | null = null
  private sequelizeModel: ModelStatic<SequelizeModel<any, any>> | null = null

  constructor(
    private modelName: string,
    private attributes: FieldsConfig,
    private customSchema?: Schema // Allow passing a custom Mongoose schema
  ) {
    const databaseService = DatabaseService.getInstance()
    if (config.database.connection === 'mongodb') {
      const schema = this.customSchema || createMongooseSchema(this.attributes)

      if (!mongoose.models[modelName]) {
        mongoose.model(modelName, schema)
      }

      this.mongooseModel = mongoose.models[modelName] as Model<T & M>
    } else if (config.database.connection === 'mysql') {
      const sequelizeAttributes = this.customSchema || createSequelizeAttributes(this.attributes)
      this.sequelizeModel = databaseService.getSequelizeModel(modelName, sequelizeAttributes)
    }
  }

  public getMongooseModel(): Model<T & M> | null {
    return this.mongooseModel
  }

  public getSequelizeModel(): ModelStatic<SequelizeModel<any, any>> | null {
    return this.sequelizeModel
  }

  public getAll = async (params: Record<string, any> = {}): Promise<T[] | PaginatedResponse<T>> => {
    const {
      page = DEFAULT_PAGINATION_OPTIONS.page,
      perPage = DEFAULT_PAGINATION_OPTIONS.perPage,
      paginate = false,
      sort = { createdAt: -1 },
      ...query
    } = params

    const skip = (parseInt(page) - 1) * parseInt(perPage)

    if (this.mongooseModel) {
      const mongooseQuery: Record<string, any> = query
      if (paginate) {
        const [result, totalCount] = await Promise.all([
          this.mongooseModel.find(mongooseQuery).sort(sort).skip(skip).limit(perPage).lean(),
          this.mongooseModel.countDocuments(mongooseQuery),
        ])

        return {
          result: result as T[],
          pagination: buildPaginationMeta(totalCount, page, perPage),
        }
      }

      return (await this.mongooseModel.find(mongooseQuery)).map(doc => doc.toObject() as T)
    }

    if (this.sequelizeModel) {
      if (paginate) {
        const { count: totalCount, rows } = await this.sequelizeModel.findAndCountAll({
          where: query,
          offset: skip,
          limit: perPage,
          order: Object.entries(sort).map(([key, value]) => [key, value === 1 ? 'ASC' : 'DESC'])
        })

        return {
          result: rows.map(result => result.get({ plain: true }) as T),
          pagination: buildPaginationMeta(totalCount, page, perPage),
        }
      }

      return (await this.sequelizeModel.findAll({ where: query })).map(
        result => result.get({ plain: true }) as T
      )
    }

    throw new Error(`Database model "${this.modelName}" not initialized.`)
  }

  public aggregate = async (pipeline: PipelineStage[]): Promise<any[]> => {
    if (this.mongooseModel) {
      return this.mongooseModel.aggregate(pipeline)
    }
    throw new Error(`Aggregation is only supported in MongoDB.`)
  }

  public getOne = async (params: Record<string, any> = {}): Promise<T | null> => {
    if (this.mongooseModel) {
      const result = await this.mongooseModel.findOne(params)
      return result ? (result.toObject() as T) : null
    } else if (this.sequelizeModel) {
      const result = await this.sequelizeModel.findOne({ where: params })
      return result ? (result.get({ plain: true }) as T) : null
    }
    throw new Error(`Database model "${this.modelName}" not initialized.`)
  }

  public getById = async (id: string): Promise<T | null> => {
    if (this.mongooseModel) {
      if (!isValidObjectId(id)) throw new Error(`Invalid ObjectId: ${id}`)
      const result = await this.mongooseModel.findById(id)
      return result ? (result.toObject() as T) : null
    } else if (this.sequelizeModel) {
      const result = await this.sequelizeModel.findByPk(id)
      return result ? (result.get({ plain: true }) as T) : null
    }
    throw new Error(`Database model "${this.modelName}" not initialized.`)
  }

  public create = async (data: Partial<T>, transaction?: Transaction): Promise<T> => {
    if (this.mongooseModel) {
      const result = await this.mongooseModel.create(data)
      return result.toObject() as T
    } else if (this.sequelizeModel) {
      const result = await this.sequelizeModel.create(data as any, { transaction })
      return result.get({ plain: true }) as T
    }
    throw new Error(`Database model "${this.modelName}" not initialized.`)
  }

  public update = async (
    id: string,
    data: Partial<T>,
    transaction?: Transaction
  ): Promise<T | null> => {
    if (this.mongooseModel) {
      const result = await this.mongooseModel.findByIdAndUpdate(id, data as UpdateQuery<T & M>, {
        new: true,
      })
      return result ? (result.toObject() as T) : null
    } else if (this.sequelizeModel) {
      const [affectedCount] = await this.sequelizeModel.update(data, {
        where: { id } as any,
        transaction,
      })
      if (affectedCount > 0) {
        const result = await this.sequelizeModel.findByPk(id)
        return result ? (result.get({ plain: true }) as T) : null
      }
      return null
    }
    throw new Error(`Database model "${this.modelName}" not initialized.`)
  }

  public delete = async (id: string, transaction?: Transaction): Promise<boolean> => {
    if (this.mongooseModel) {
      if (!isValidObjectId(id)) throw new Error(`Invalid ObjectId: ${id}`)
      const result = await this.mongooseModel.findByIdAndDelete(id)
      return result !== null
    } else if (this.sequelizeModel) {
      const affectedRows = await this.sequelizeModel.destroy({ where: { id } as any, transaction })
      return affectedRows > 0
    }
    throw new Error(`Database model "${this.modelName}" not initialized.`)
  }

  public softDelete = async (id: string, transaction?: Transaction): Promise<boolean> => {
    if (this.mongooseModel) {
      if (!isValidObjectId(id)) throw new Error(`Invalid ObjectId: ${id}`)
      const result = await this.mongooseModel.findByIdAndUpdate(
        id,
        {
          deletedAt: new Date(),
        },
        {
          new: true,
        }
      )
      return result !== null
    } else if (this.sequelizeModel) {
      const [affectedCount] = await this.sequelizeModel.update(
        {
          deletedAt: new Date(),
        },
        {
          where: { id } as any,
          transaction,
        }
      )
      return affectedCount > 0
    }
    throw new Error(`Database model "${this.modelName}" not initialized.`)
  }

  public count = async (params: Record<string, any> = {}): Promise<number> => {
    if (this.mongooseModel) {
      return await this.mongooseModel.countDocuments(params)
    } else if (this.sequelizeModel) {
      return await this.sequelizeModel.count({ where: params })
    }
    throw new Error(`Database model "${this.modelName}" not initialized.`)
  }

  public rawQuery = async (query: string, replacements?: any[]): Promise<any> => {
    if (this.sequelizeModel) {
      const sequelize = this.sequelizeModel.sequelize!
      return await sequelize.query(query, { replacements, type: QueryTypes.SELECT })
    }
    throw new Error(`Raw queries are only supported for MySQL.`)
  }
}
