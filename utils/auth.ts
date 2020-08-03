import dotenv from 'dotenv'
import { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import passport from 'passport'
import { User } from '../resources/users/users.model'
import { check, validationResult } from 'express-validator'

const Strategy = require('passport-local').Strategy

dotenv.config({
  path: '../config/.env.dev',
})

const JWT_SECRET = process.env.JWT_SECRET || ''
const jwtOptions: jwt.SignOptions = {
  algorithm: 'HS256',
  expiresIn: '100d',
}
const COOKIE_MAX_AGE = 1000 * 60 * 60 * 24 * 365 // 1 year cookie

const adminPassword = process.env.ADMIN_PASSWORD || 'iamthewalrus'
// passport.use(adminStrategy())
const authenticate = passport.authenticate('local', { session: false })

// const sign = async (user: any) => {
const sign = async (user: any) => {
  // const token = await jwt.sign({ id: user._id }, JWT_SECRET, jwtOptions)
  const token = await jwt.sign({ id: user._id }, JWT_SECRET, jwtOptions)
  return token
}

const verify = async (jwtString: string) => {
  // const token = jwtString.split('Bearer ')[1].trim()
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
    return res.status(400).json({ errors: errors.array() })
  }

  const { email, password, username } = req.body

  try {
    const user = await User.create({ email, password, username })
    const token = await sign(user)

    return res.status(201).json({ success: true, user, token })
  } catch (err) {
    console.error(`Error signing up: ${err.message}`)

    if (err.code === 11000) {
      return res.status(400).json({ success: false, error: 'Email already exists' })
    }

    return res.status(500).json({
      error: err.message,
    })
  }
}

export const login = async (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }

  const { email, password } = req.body

  const error = { success: false, error: 'Invalid credentials' }

  try {
    const user = await User.findOne({ email }).select('email password').exec()

    if (!user) {
      return res.status(401).json(error)
    }

    const match = await user.checkPassword(password)

    if (!match) {
      return res.status(401).json(error)
    }

    const token = await sign(user)

    res.cookie('jwt', token, { httpOnly: true, maxAge: COOKIE_MAX_AGE })

    return res.status(201).json({ success: true, user, token })
  } catch (err) {
    console.error(`Error logging in: ${err.message}`)

    return res.status(500).json({
      success: false,
      error: err.message,
    })
  }
}

export const ensureUser = async (req: Request, res: Response, next: NextFunction) => {
  // @ts-ignore
  const bearer = req.headers.authorization || req.cookies.jwt

  if (!bearer) {
    //  || !bearer.startsWith('Bearer ')
    return res.status(401).json({
      success: false,
      error: 'No authorization token',
    })
  }

  let payload

  try {
    payload = await verify(bearer)
  } catch (err) {
    console.error(`Unauthorized (invalid token): ${err.message}`)

    return res.status(401).json({
      success: false,
      error: err.message,
    })
  }

  // TODO: remove @ts-ignore
  // @ts-ignore
  const user = await User.findById(payload.id).select('-password').lean().exec()

  if (!user) {
    return res.status(401).json({
      success: false,
      error: 'Invalid credentials',
    })
  }

  // @ts-ignore
  req.user = user

  next()
}

export const ensureAdmin = async (req: Request, res: Response, next: NextFunction) => {
  // @ts-ignore
  const bearer = req.headers.authorization || req.cookies.jwt
  console.log('Cookies: ', req.cookies)
  console.log('Signed Cookies: ', req.signedCookies)

  try {
    const payload = await verify(bearer)

    // @ts-ignore
    if (payload.id === '5f286973c37105343cfe40db' || payload.permissions.includes('admin')) {
      return next()
    }
  } catch (err) {
    // res.status(403).json({
    //   success: false,
    //   error: 'Forbidden',
    // })
    err.statusCode = 403
    // err.message = 'Forbidden'
    next(err)
  }
}

// export const hasPermission = (user: any, permissionsNeeded: string[]) => {
//   const matchedPermissions = user.permissions.filter(permissionTheyHave =>
//     permissionsNeeded.includes(permissionTheyHave),
//   )

//   if (!matchedPermissions.length) {
//     throw new Error(`You do not have sufficient permissions
//       : ${permissionsNeeded}
//       You Have:
//       ${user.permissions}
//       `)
//   }
// }

// const ownsItem = item.user.id === ctx.request.userId
// const hasPermissions = ctx.request.user.permissions.some(permission =>
//   ['ADMIN', 'ITEMDELETE'].includes(permission),
// )

// if (!ownsItem && !hasPermissions) {
//   throw new Error("You don't have permission to do that!")
// }
