import dotenv from 'dotenv'
import { NextFunction, Request, Response } from 'express'
import { check, validationResult } from 'express-validator'
import jwt from 'jsonwebtoken'
import passport from 'passport'
import { User } from '../resources/users/users.model'
import ErrorResponse from './error'

const Strategy = require('passport-local').Strategy

dotenv.config({
  path: __dirname + './../config/.env',
})

export const JWT_SECRET = process.env.JWT_SECRET || ''
const jwtOptions: jwt.SignOptions = {
  algorithm: 'HS256',
  expiresIn: '100d',
}
const COOKIE_MAX_AGE = 1000 * 60 * 60 * 24 * 365 // 1 year cookie

const adminPassword = process.env.ADMIN_PASSWORD || 'iamthewalrus'
// passport.use(adminStrategy())
const authenticate = passport.authenticate('local', { session: false })

export const sign = async (id: string) => {
  const token = await jwt.sign({ id }, JWT_SECRET, jwtOptions)
  return token
}

export const verify = async (jwtString: string) => {
  const token = jwtString
    .replace(/^Bearer /i, '')
    .replace(/^jwt= /i, '')
    .trim()

  try {
    const payload = await jwt.verify(token, JWT_SECRET)
    return payload
  } catch (err) {
    err.statusCode = 401
    throw err
  }
}

/* export const adminStrategy = () => {
  return new Strategy(async (username: string, password: string, cb: any) => {
    const isAdmin = username === 'admin' && password === adminPassword

    if (isAdmin) {
      return cb(null, { username: 'admin' })
    }

    try {
      const user = await User.findOne({ email: 'admin@admin.com' })

      if (!user) {
        return cb(null, false)
      }

      const isUser = await bcrypt.compare(password, user.password)

      if (isUser) {
        return cb(null, { data: user })
      }
    } catch (err) {}

    cb(null, false)
  })
} */

export const validate = [
  check('email', 'Please include a valid email')
    .exists()
    .isEmail()
    .normalizeEmail()
    .isLength({ min: 5, max: 50 }),
  check('password', 'Password is required').exists().trim().isLength({ min: 8, max: 50 }),
]

export const validateRegister = [
  ...validate,
  check('passwordConfirmation').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Password confirmation does not match password')
    }
    return true
  }),
]

export const register = async (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    const validationErrors = errors.array().map(e => e.msg)
    return next(new ErrorResponse('ValidationError', 400, validationErrors))
  }

  const { email, password, username } = req.body

  try {
    const user = await User.create({ email, password, username })
    const token = await sign(user._id)

    return res.status(201).json({ success: true, data: { user, token } })
  } catch (err) {
    console.error(`Error signing up: ${err.message}`)

    next(err)
  }
}

export const login = async (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    const validationErrors = errors.array().map(e => e.msg)
    return next(new ErrorResponse('ValidationError', 400, validationErrors))
  }

  const { email, password } = req.body

  try {
    const user = await User.findOne({ email }).select('email password username').exec()

    if (!user) {
      return next(new ErrorResponse('Invalid credentials', 401))
    }

    const match = user.checkPassword(password)

    if (!match) {
      return next(new ErrorResponse('Invalid credentials', 401))
    }

    const token = await sign(user._id)

    // res.setHeader('Set-Header', `jwt=${token}`)
    res.cookie('jwt', token, { httpOnly: true, maxAge: COOKIE_MAX_AGE, secure: true })

    return res.status(201).json({ success: true, data: { user, token } })
  } catch (err) {
    console.error(`Error logging in: ${err.message}`)

    next(err)
  }
}

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.cookie('jwt', 'none', {
      expires: new Date(Date.now() + 10 * 1000),
      maxAge: 1,
      httpOnly: true,
      secure: true,
    })

    return res.status(201).json({ success: true, user: {} })
  } catch (err) {
    console.error(`Error logging in: ${err.message}`)

    next(err)
  }
}

export const ensureUser = async (req: Request, res: Response, next: NextFunction) => {
  // @ts-ignore
  const token = req.headers.authorization || req.cookies.jwt

  if (!token) {
    return next(new ErrorResponse('No authorization token', 401))
  }

  let payload

  try {
    payload = await verify(token)
  } catch (err) {
    next(new ErrorResponse(`Unauthorized (invalid token): ${err.message}`, 401))
  }

  // @ts-ignore
  const user = await User.findById(payload.id).select('-password').lean().exec()

  if (!user) {
    return next(new ErrorResponse('Invalid credentials', 401))
  }

  // TODO: save in locals instead
  // @ts-ignore
  req.user = user

  next()
}

export const ensureAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // @ts-ignore
    const user = await User.findById(req.user._id).select('-password').exec()

    // @ts-ignore
    const isAdmin = await user.isAdmin()

    if (!isAdmin) {
      next(new ErrorResponse('Not enough permissions', 401))
    }

    // @ts-ignore
    req.user.isAdmin = true

    next()
  } catch (err) {
    next(err)
  }
}

export const ensureOwnerOrAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // @ts-ignore
    const user = req.user
    // @ts-ignore
    const model = req.model
    const resourceId = req.params.id

    // @ts-ignore
    const isAdmin = user.permissions.includes('ADMIN')

    const resource = await model.findById(resourceId).select('createdBy').lean().exec()

    if (!resource) {
      return next(new ErrorResponse('Resource not found', 404))
    }

    // @ts-ignore
    const isOwner = user._id.toString() === resource.createdBy.toString()

    if (!isOwner && !isAdmin) {
      return next(new ErrorResponse('Not enough permissions', 401))
    }

    next()
  } catch (err) {
    next(err)
  }
}
