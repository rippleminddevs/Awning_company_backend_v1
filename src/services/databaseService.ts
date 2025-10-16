import mongoose from 'mongoose'
import { Sequelize, Model, ModelStatic } from 'sequelize'
import { config } from './configService'

export class DatabaseService {
  private static instance: DatabaseService
  private sequelize: Sequelize | null = null

  private constructor() {
    this.connect() // Ensure connection is established when the instance is created
  }

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService()
    }
    return DatabaseService.instance
  }

  public connect = (): void => {
    if (config.database.connection === 'mongodb') {
      this.initMongoDB()
    } else if (config.database.connection === 'mysql') {
      this.initMySQL()
    }
  }

  private initMongoDB = (): void => {
    const { host, port, database, username, password, atlas } = config.database.mongodb
    const connectionString = atlas
      ? `mongodb+srv://${username}:${password}@${host}/${database}?retryWrites=true&w=majority`
      : `mongodb://${host}:${port}/${database}`
    mongoose.connect(connectionString)
    console.log('✅ Connected to MongoDB')
  }

  private initMySQL = (): void => {
    const { host, port, username, password, database } = config.database.mysql
    this.sequelize = new Sequelize(database, username, password, {
      host,
      port,
      dialect: 'mysql',
      logging: false,
    })
    console.log('✅ Connected to MySQL')
  }

  public getMongooseModel = <T>(
    modelName: string,
    schema: mongoose.Schema
  ): mongoose.Model<T & mongoose.Document> => {
    return mongoose.model<T & mongoose.Document>(modelName, schema)
  }

  public getSequelizeModel = (modelName: string, attributes: any): ModelStatic<Model> => {
    if (!this.sequelize) {
      throw new Error('Sequelize not initialized')
    }

    return this.sequelize.define(modelName, attributes)
  }
}
