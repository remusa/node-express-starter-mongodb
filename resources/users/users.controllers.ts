import { NextFunction, Request, Response } from 'express'
import { Error } from 'mongoose'
import { crudControllers } from '../../utils/crud'
import { User } from './users.model'

// @desc Get info about current user
// @route GET /api/v1/me
// @access Public
export const getMe = () => async (req: Request, res: Response, next: NextFunction) => {
  // const me = req.user || null
  const me = null

  res.status(200).json({
    success: true,
    data: me,
  })
}

// @desc Update current user
// @route PUT /api/v1/me
// @access Public
export const updateMe = () => async (req: Request, res: Response, next: NextFunction) => {
  try {
    // const id = req.user._id
    const id = null
    const updatedValues = req.body

    const user = await User.findOneAndUpdate(id, updatedValues, { new: true }).lean()

    return res.status(200).json({
      success: true,
      message: 'Succesfully updated user',
      data: user,
    })
  } catch (err) {
    console.error(`Error updating user: ${err.message}`)

    if (err instanceof Error.CastError) {
      return res.status(400).json({
        error: 'User id is invalid',
      })
    }

    res
      .status(500)
      .json({
        error: `Server error: ${err.message}`,
      })
      .end()
  }
}

const userControllers = crudControllers(User)

export default {
  ...userControllers,
  getMe,
  updateMe,
}
