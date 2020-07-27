import { Request, Response } from 'express'
import { Error, Model } from 'mongoose'

// @desc Get many resources
// @route GET /api/v1/resource
// @access Public
const getMany = (model: Model<any>) => async (req: Request, res: Response) => {
  await model
    .find()
    .lean()
    .exec()
    .then(docs => {
      return res.status(200).json({
        success: true,
        count: docs.length,
        data: docs,
      })
    })
    .catch(err => {
      console.error(`Error getting resources: ${err.message}`)

      return res
        .status(400)
        .json({
          error: `Server error: ${err.message}`,
        })
        .end()
    })
}

// @desc Get one resource by id
// @route GET /api/v1/resource/:id
// @access Public
const getOne = (model: Model<any>) => async (req: Request, res: Response) => {
  const { id } = req.params

  await model
    .findById(id)
    .lean()
    .exec()
    .then(user => {
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'Resource not found',
        })
      }

      return res.status(200).json({
        success: true,
        data: user,
      })
    })
    .catch(err => {
      console.error(`Error creating resource: ${err.message}`)

      if (err instanceof Error.CastError) {
        return res
          .status(400)
          .json({
            success: false,
            error: 'Invalid resource id',
          })
          .end()
      }

      return res.status(500).json({
        error: `Server error: ${err.message}`,
      })
    })
}

// @desc Create one resource
// @route POST /api/v1/resource
// @access Public
const createOne = (model: Model<any>) => async (req: Request, res: Response) => {
  try {
    const newDoc = await model.create(req.body)

    return res.status(201).json({
      success: true,
      data: newDoc,
    })
  } catch (err) {
    console.error(`Error creating resource: ${err.message}`)

    if (err.code === 11000) {
      return res.status(400).json({
        error: 'Resource already exists',
      })
    }

    res.status(500).json({
      error: `Server error: ${err.message}`,
    })
  }
}

// @desc Delete one resource by id
// @route DELETE /api/v1/resource
// @access Public
const deleteOne = (model: Model<any>) => async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const deleted = await model
      .findOneAndRemove({
        _id: id,
      })
      .lean()
      .exec()

    if (!deleted) {
      return res
        .status(404)
        .json({
          success: false,
          error: 'Resource not found',
        })
        .end()
    }

    return res.status(200).json({
      success: true,
      message: 'Successfully deleted resource',
    })
  } catch (err) {
    console.error(`Error deleting resource: ${err.message}`)

    if (err instanceof Error.CastError) {
      return res
        .status(400)
        .json({
          error: 'Resource id is invalid',
        })
        .end()
    }

    res.status(500).json({
      error: `Server error: ${err.message}`,
    })
  }
}

// @desc Update one resource by id
// @route GET /api/v1/resource/:id
// @access Public
const updateOne = (model: Model<any>) => async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const updatedValues = req.body

    const updatedDoc = await model
      .findOneAndUpdate(
        {
          _id: req.params.id,
        },
        updatedValues,
        { new: true },
      )
      .lean()
      .exec()

    if (!updatedDoc) {
      return res.status(400).json({
        success: false,
        message: 'Failed to update resource',
        data: updatedDoc,
      })
    }

    return res.status(200).json({
      success: true,
      message: 'Succesfully updated resource',
      data: updatedDoc,
    })
  } catch (err) {
    console.error(`Error updating resource: ${err.message}`)

    if (err instanceof Error.CastError) {
      return res.status(400).json({
        error: 'Resource id is invalid',
      })
    }

    res.status(500).json({
      error: `Server error: ${err.message}`,
    })
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
