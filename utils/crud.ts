import { Request, Response, NextFunction } from 'express'
import { Error, Model } from 'mongoose'
import ErrorResponse from './error'

// @desc Get many resources
// @route GET /api/v1/resource
// @access Public
const getMany = (model: Model<any>) => async (req: Request, res: Response, next: NextFunction) => {
  try {
    const docs = await model.find().lean().exec()

    return res.status(200).json({
      success: true,
      count: docs.length,
      data: docs,
    })
  } catch (err) {
    console.error(`Error getting resources: ${err.message}`)

    next(err)
  }
}

// @desc Get one resource by id
// @route GET /api/v1/resource/:id
// @access Public
const getOne = (model: Model<any>) => async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params

  try {
    const doc = await model.findById(id).lean().exec()
    console.log('doc', doc)

    if (doc) {
      res.status(200).json({
        success: true,
        data: doc,
      })
    }
  } catch (err) {
    console.error(`Error getting resource: ${err.message}`)

    next(new ErrorResponse('Resource not found', 404))
  }
}

// @desc Create one resource
// @route POST /api/v1/resource
// @access Public
const createOne = (model: Model<any>) => async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const newDoc = await model.create(req.body)

    return res.status(201).json({
      success: true,
      data: newDoc,
    })
  } catch (err) {
    console.error(`Error creating resource: ${err.message}`)

    next(err)
  }
}

// @desc Delete one resource by id
// @route DELETE /api/v1/resource
// @access Public
const deleteOne = (model: Model<any>) => async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params

    const deleted = await model
      .findOneAndRemove({
        _id: id,
      })
      .lean()
      .exec()

    if (!deleted) {
      next(new ErrorResponse('Resource not found', 404))
    }

    return res.status(200).json({
      success: true,
      message: 'Successfully deleted resource',
    })
  } catch (err) {
    console.error(`Error deleting resource: ${err.message}`)

    next(err)
  }
}

// @desc Update one resource by id
// @route GET /api/v1/resource/:id
// @access Public
const updateOne = (model: Model<any>) => async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params
    const updatedValues = req.body

    const updatedDoc = await model
      .findOneAndUpdate(
        {
          _id: id,
        },
        updatedValues,
        { new: true },
      )
      .lean()
      .exec()

    if (!updatedDoc) {
      next(new ErrorResponse('Failed to update resource', 400))
    }

    return res.status(200).json({
      success: true,
      message: 'Succesfully updated resource',
      data: updatedDoc,
    })
  } catch (err) {
    console.error(`Error updating resource: ${err.message}`)

    next(err)
  }
}

// Generic CRUD controllers
export const crudControllers = (model: Model<any>) => {
  return {
    getMany: getMany(model),
    getOne: getOne(model),
    createOne: createOne(model),
    updateOne: updateOne(model),
    deleteOne: deleteOne(model),
  }
}
