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
const jwtOptions: jwt.SignOptions = {
  algorithm: 'HS256',
  expiresIn: '100d',
}
const adminPassword = process.env.ADMIN_PASSWORD || 'iamthewalrus'

passport.use(adminStrategy())
const authenticate = passport.authenticate('local', { session: false })

const sign = async (user: any) => {
  const token = await jwt.sign({ id: user._id }, JWT_SECRET, jwtOptions)
  return token
}

const verify = async (token: string) => {
  const jwtString = token.replace(/^Bearer /i, '')

  try {
    const payload = await jwt.verify(jwtString, JWT_SECRET)
    return payload
  } catch (err) {
    err.statusCode = 401
    throw err
  }
}

function adminStrategy() {
  return new Strategy(function (username: string, password: string, cb: any) {
    const isAdmin = username === 'admin' && password === adminPassword
    if (isAdmin) return cb(null, { username: 'admin' })
    cb(null, false)
  })
}

export const register = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password, username } = req.body

  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Invalid credentials' })
  }

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
  const { email, password } = req.body
  const error = { success: false, error: 'Invalid credentials' }

  if (!email || !password) {
    return res.status(400).json(error)
  }

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

    res.cookie('jwt', token, { httpOnly: true })

    return res.status(201).json({ success: true, user, token })
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
    return res.status(401).json({
      success: false,
      error: 'No authorization token',
    })
  }

  const token = bearer.split('Bearer ')[1].trim()

  let payload

  try {
    payload = await verify(token)
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

  // @ts-ignore
  req.user = user

  next()
}
