import { Request, Response, NextFunction } from 'express'
import { Store } from '../../models/Store'

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
    res.status(500).json({
      error: 'Server error',
    })
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

    if (err.code === 11000) {
      return res.status(400).json({
        error: 'Store already exists',
      })
    }

    res.status(500).json({
      error: `Server error: ${err.message}`,
    })
  }
}

export { getStores, postStore }
