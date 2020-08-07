import cookieParser from 'cookie-parser'
import cors from 'cors'
import mongoSanitize from 'express-mongo-sanitize'
import dotenv from 'dotenv'
import express, { json, NextFunction, Request, Response, urlencoded } from 'express'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import hpp from 'hpp'
import morgan from 'morgan'
import path from 'path'
import connectDB from './config/db'
import postsRouter from './resources/posts/posts.router'
import storesRouter from './resources/stores/stores.router'
import usersRouter from './resources/users/users.router'
import {
  ensureAdmin,
  ensureUser,
  login,
  register,
  validate,
  validateRegister,
  logout,
} from './utils/auth'
import middleware from './utils/middleware'
import ErrorResponse from './utils/error'

dotenv.config({
  path: './config/.env',
})

const PORT = process.env.PORT || 8000
const ENV: string = process.env.NODE_ENV || 'development'
const DB_URL: string = process.env.DB_URL || ''
const CORS_WHITELIST =
  ENV === 'production' ? process.env.CORS_WHITELIST && process.env.CORS_WHITELIST.split(',') : '*'

// Database
connectDB(DB_URL)

// Express
const app: express.Application = express()

// Logging
app.use(middleware.logger)
app.use(morgan('dev'))

// Security headers
app.disable('x-powered-by')
app.use(helmet())

// CORS
app.use(
  cors({
    origin: CORS_WHITELIST,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept',
    credentials: true,
    maxAge: 86400,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  }),
)

// Sanitize data
app.use(mongoSanitize())

// Rate limiting
app.use(
  rateLimit({
    windowMs: 10 * 60 * 1000, // 10 mins
    max: 100,
  }),
)

// HTTP param pollution
app.use(hpp())

// Parsing
app.use(json()) // body-parser
app.use(urlencoded({ extended: true }))
app.use(cookieParser())

// Static folder
const PUBLIC: string = path.join(__dirname, 'public/')
app.use(express.static(PUBLIC))

// Routes
const publicFile = (file: string): string => path.join(PUBLIC, file)

app.get('/', (req: Request, res: Response) => res.sendFile(publicFile('index.html')))
app.get('/add', (req: Request, res: Response) => res.sendFile(publicFile('add.html')))

// Auth routes
app.post('/auth/register', validateRegister, register)
app.post('/auth/login', validate, login)
app.get('/auth/logout', logout)

// API routes
app.use('/api', ensureUser)
app.use('/api/v1/stores', storesRouter)
app.use('/api/v1/posts', postsRouter)
app.use('/api/v1/users', usersRouter)

// Admin routes
app.use('/api/v1/admin', ensureAdmin, (req: Request, res: Response, next: NextFunction) => {
  res.status(200).json({
    success: true,
    messagge: 'Admin privileges',
  })
})

// Catch 404 and forward to error handler
app.use((req: Request, res: Response, next: NextFunction) => {
  const err = new ErrorResponse('Not Found', 404)

  return next(err)
})

// Error handler
app.use(middleware.errorHandler)

// Server
app.listen(PORT, () => console.log(`⚡️[🚀]: Server running in ${ENV} mode on port ${PORT}`))
