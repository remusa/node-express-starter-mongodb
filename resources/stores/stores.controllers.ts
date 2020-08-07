import { NextFunction, Request, Response } from 'express'
import { Store } from './stores.model'
import { crudControllers } from '../../utils/crud'
import ErrorResponse from '../../utils/error'

// @desc Get all stores
// @route GET /api/v1/stores
// @access Public
const getStores = () => async (req: Request, res: Response, next: NextFunction) => {
  try {
    const stores = await Store.find()

    return res.status(200).json({
      success: true,
      count: stores.length,
      data: stores,
    })
  } catch (err) {
    console.error(`Error getting stores: ${err.message}`)

    next(err)
  }
}

// @desc Create a store
// @route POST /api/v1/stores
// @access Public
const postStore = () => async (req: Request, res: Response, next: NextFunction) => {
  try {
    const store = await Store.create(req.body)

    return res.status(201).json({
      success: true,
      data: store,
    })
  } catch (err) {
    console.error(`Error posting store: ${err.message}`)

    next(err)
  }
}

const storeControllers = crudControllers(Store)

export default {
  ...storeControllers,
  getStores,
  postStore,
}
