import { Request, Response, NextFunction } from 'express'
import { User } from '../../models/User'
import mongoose, { Error } from 'mongoose'

// @desc Get all users
// @route GET /api/v1/users
// @access Public
const getUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await User.find().sort({ email: 1 })

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

// @desc Get an user by its id
// @route GET /api/v1/users/:id
// @access Public
const getUser = () => async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params
    const user = await User.findById(userId)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User with that id doesn't exist",
      })
    }

    return res.status(200).json({
      success: true,
      data: user,
    })
  } catch (err) {
    console.error(`Error creating user: ${err.message}`)

    res.status(500).json({
      error: `Server error: ${err.message}`,
    })
  }
}

// @desc Create an user
// @route POST /api/v1/users
// @access Public
const createUser = () => async (req: Request, res: Response, next: NextFunction) => {
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

// @desc Delete an user
// @route DELETE /api/v1/users
// @access Public
const deleteUser = () => async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params

    await User.findOneAndDelete({ _id: userId }).then(() => {
      return res.status(200).json({
        success: true,
        message: 'Succesfully deleted user',
      })
    })
  } catch (err) {
    console.error(`Error deleting user: ${err.message}`)

    if (err instanceof Error.CastError) {
      return res.status(400).json({
        error: 'User id is invalid',
      })
    }

    res.status(500).json({
      error: `Server error: ${err.message}`,
    })
  }
}

// @desc Get an user by its id
// @route GET /api/v1/users/:id
// @access Public
const updateUser = () => async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params
    const updatedValues = req.body

    await User.findOneAndUpdate({ _id: userId }, updatedValues).then(user => {
      return res.status(200).json({
        success: true,
        message: 'Succesfully updated user',
        data: user,
      })
    })
  } catch (err) {
    console.error(`Error updating user: ${err.message}`)

    if (err instanceof Error.CastError) {
      return res.status(400).json({
        error: 'User id is invalid',
      })
    }

    res.status(500).json({
      error: `Server error: ${err.message}`,
    })
  }
}

export { getUsers, getUser, createUser, updateUser, deleteUser }
