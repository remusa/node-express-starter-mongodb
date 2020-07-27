import { Request, Response, NextFunction } from 'express'
import { User } from '../../models/User'

// @desc Get all users
// @route GET /api/v1/users
// @access Public
const getUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await User.find()

    return res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    })
  } catch (err) {
    console.error(`Error getting stores: ${err.message}`)
    res.status(500).json({
      error: 'Server error',
    })
  }
}

// @desc Create an user
// @route POST /api/v1/users
// @access Public
const postUser = () => async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.create(req.body)

    return res.status(201).json({
      success: true,
      data: user,
    })
  } catch (err) {
    console.error(`Error creating user: ${err.message}`)

    if (err.code === 11000) {
      return res.status(400).json({
        error: 'User already exists',
      })
    }

    res.status(500).json({
      error: `Server error: ${err.message}`,
    })
  }
}

export { getUsers, postUser }
