import { NextFunction, Request, Response } from 'express'
import { Error } from 'mongoose'
import { crudControllers } from '../../utils/crud'
import { User } from './users.model'
import ErrorResponse from '../../utils/error'

// @desc Get info about current user
// @route GET /api/v1/me
// @access Public
const getMe = () => async (req: any, res: Response, next: NextFunction) => {
  const me = req.user

  return res.status(200).json({
    success: true,
    data: me,
  })
}

// @desc Update current user
// @route PUT /api/v1/me
// @access Public
const updateMe = () => async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.user
    const updatedValues = req.body

    // User can't update own permissions
    delete updatedValues['permissions']

    if (!id) {
      next(new ErrorResponse("User id doesn't exist", 400))
    }

    const user = await User.findOneAndUpdate(
      {
        _id: id,
      },
      updatedValues,
      { new: true },
    )
      .lean()
      .exec()

    return res.status(200).json({
      success: true,
      message: 'Succesfully updated user',
      data: user,
    })
  } catch (err) {
    console.error(`Error updating user: ${err.message}`)

    next(err)
  }
}

const userControllers = crudControllers(User)

export default {
  ...userControllers,
  getMe,
  updateMe,
}
