import dotenv from 'dotenv'
import { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { User } from '../resources/users/users.model'
import bcrypt from 'bcryptjs'
const passport = require('passport')
const Strategy = require('passport-local').Strategy

dotenv.config({
  path: '../config/.env.dev',
})

const JWT_SECRET = process.env.JWT_SECRET || ''
const jwtOpts: jwt.SignOptions = { algorithm: 'HS256', expiresIn: '30d' }

// passport.use(adminStrategy())
const authenticate = passport.authenticate('local', { session: false })

const sign = async (payload: any) => {
  const token = await jwt.sign(payload, JWT_SECRET, jwtOpts)
  return token
}

const verifyToken = (token: string) =>
  new Promise((resolve, reject) => {
    jwt.verify(token, JWT_SECRET, (err: any, payload: any) => {
      if (err) {
        return reject(err)
      }

      resolve(payload)
    })
  })

export const signup = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ error: 'Invalid credentials' })
  }

  try {
    const user = await User.create({ email, password })
    const token = sign(user)

    return res.status(201).json({ success: true, user, token })
  } catch (err) {
    console.error(`Error signing up: ${err.message}`)

    if (err.code === 11000) {
      return res.status(400).json({
        error: 'Email already exists',
      })
    }

    return res
      .status(500)
      .json({
        error: err.message,
      })
      .end()
  }
}

export const login = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body
  const error = { success: false, error: 'Invalid credentials' }

  if (!email || !password) {
    return res.status(400).json(error)
  }

  try {
    const user = await User.findOne({ email }).select('email password').exec()

    if (!user) {
      return res.status(401).send(error)
    }

    // TODO: remove @ts-ignore
    // @ts-ignore
    // const match = await user.checkPassword(password)
    const match = await bcrypt.compare(password, user.password)

    if (!match) {
      return res.status(401).send(error)
    }

    const token = sign(user)

    res.cookie('jwt', token, { httpOnly: true })

    return res.status(201).json({ success: true, token })
  } catch (err) {
    console.error(`Error logging in: ${err.message}`)

    return res.status(500).json({
      success: false,
      error: err.message,
    })
  }
}

export const protect = async (req: Request, res: Response, next: NextFunction) => {
  const { authorization: bearer } = req.headers

  if (!bearer || !bearer.startsWith('Bearer ')) {
    return res.status(401).end()
  }

  const token = bearer.split('Bearer ')[1].trim()

  let payload

  try {
    payload = await verifyToken(token)
  } catch (err) {
    console.error(`Invalid token: ${err.message}`)

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

  // TODO: remove @ts-ignore
  // @ts-ignore
  req.user = user

  next()
}
