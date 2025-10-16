import 'express-async-errors'
import express, { Application, Request, Response, NextFunction } from 'express'
import cors from 'cors'
import morgan from 'morgan'
import { createServer, Server } from 'http'
// import { createServer as createHttpServer, Server as HttpServer } from 'http'
// import { createServer as createHttpsServer, Server as HttpsServer } from 'https'
import routes from './routes'
import { ErrorHandler } from './common/utils/errorHandler'
import { DatabaseService } from './services/databaseService'
import { config } from './services/configService'
import { AppError } from './common/utils/appError'
import { apiResponse } from './common/utils/apiResponse'
import socketService from './services/socketService'
import path from 'path'
import fs from 'fs'

class App {
  public app: Application
  public server: Server

  constructor() {
    this.app = express()
    this.server = createServer(this.app)
    this.configureMiddlewares()
    this.configureRoutes()
    this.configureErrorHandling()
    this.configureDatabase()

    // // Use HTTPS if certs are available, otherwise fall back to HTTP
    // const certPath = path.resolve(__dirname, 'cert.pem')
    // const keyPath = path.resolve(__dirname, 'privkey.pem')
    // const caPath = path.resolve(__dirname, 'fullchain.pem')

    // if (fs.existsSync(certPath) && fs.existsSync(keyPath)) {
    //   const sslOptions = {
    //     key: fs.readFileSync(keyPath),
    //     cert: fs.readFileSync(certPath),
    //     ca: fs.existsSync(caPath) ? fs.readFileSync(caPath) : undefined,
    //   }
    //   this.server = createHttpsServer(sslOptions, this.app)
    // } else {
    //   console.warn('⚠️ SSL certificates not found, falling back to HTTP.')
    //   this.server = createHttpServer(this.app)
    // }

    this.configureSocketIO()
  }

  private configureMiddlewares = (): void => {
    this.app.use(cors())
    this.app.use(express.json({ limit: '50mb' }))
    this.app.use(express.urlencoded({ extended: true }))
    this.app.set('views', path.join(__dirname, 'views'));
    this.app.set('view engine', 'ejs'); 
    this.app.use('/static', express.static('static'))
    this.app.use(morgan('dev'))
    this.app.use((req: Request, res: Response, next: NextFunction) => {
      res.header('Access-Control-Allow-Origin', '*')
      res.header('Access-Control-Allow-Credentials', 'true')
      res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE')
      res.header(
        'Access-Control-Allow-Headers',
        'Authorization, Origin, X-Requested-With, Content-Type, Accept, Cache-Control'
      )
      const forwardedFor = req.headers['x-forwarded-for']
      let userIp: string | undefined
      if (Array.isArray(forwardedFor)) {
        userIp = forwardedFor[0]
      } else if (typeof forwardedFor === 'string') {
        userIp = forwardedFor
      } else {
        userIp = req.socket?.remoteAddress?.split(':').pop()
      }
      req.userIp = userIp === '127.0.0.1' ? '' : userIp

      next()
    })
  }

  private configureRoutes = (): void => {
    this.app.get('/', (_req: Request, res: Response) => {
      apiResponse(res, { status: 'Server is running' })
    })

    this.app.use('/api', routes)

    // Health Check
    this.app.get('/health', (_req: Request, res: Response) => {
      apiResponse(res, { status: 'OK' })
    })

    // 404 Handler
    this.app.use('*', (_req: Request, res: Response) => {
      throw AppError.notFound('404 Not Found')
    })
  }

  private configureErrorHandling = (): void => {
    const errorHandler = new ErrorHandler()
    this.app.use(errorHandler.handle)
  }

  private configureDatabase = async (): Promise<void> => {
    DatabaseService.getInstance()
  }

  private configureSocketIO = async (): Promise<void> => {
    socketService.initialize(this.server)
  }

  public start = (): void => {
    const server = this.server.listen(config.app.port, () => {
      console.log(`✅ Server is running on http://localhost:${config.app.port}`)
    })

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err: Error) => {
      console.error('Unhandled Rejection:', err)
      server.close(() => process.exit(1))
    })

    // Handle uncaught exceptions
    process.on('uncaughtException', (err: Error) => {
      console.error('Uncaught Exception:', err)
      server.close(() => process.exit(1))
    })
  }
}

export { App }
