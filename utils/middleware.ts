// @ts-ignore
import { NextFunction, Request, Response } from 'express'
import pinoLogger from 'express-pino-logger'
import mongoose from 'mongoose'
// @ts-ignore
import pinoNoir from 'pino-noir'
import ErrorResponse from './error'

function logger() {
  return pinoLogger({
    serializers: pinoNoir([
      'res.headers.set-cookie',
      'req.headers.cookie',
      'req.headers.authorization',
    ]),
  })
}

const validateObjectId = (req: Request, res: Response, next: NextFunction) => {
  const idToCheck = req.params.id

  if (!mongoose.Types.ObjectId.isValid(idToCheck)) {
    return next(new ErrorResponse(`Invalid resource id: ${req.params.id}`, 404))
  }

  next()
}

const setModel = (model: any) => (req: Request, res: Response, next: NextFunction) => {
  // @ts-ignore
  req.model = model

  next()
}

const asyncHandler = (fn: any) => (req: Request, res: Response, next: NextFunction) => {
  return Promise.resolve(fn(req, res, next)).catch(next)
}

const errorHandler = (
  err: Error | ErrorResponse | any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let error = { ...err, status: err.status, message: err.message }
  // console.error('errorHandler | error', error)

  // Mongoose invalid ObjectId
  if (error.name === 'CastError') {
    error = new ErrorResponse(`Resource '${Object.values(error.keyValue)}' not found`, 404)
  }
  // Mongoose resource already exists
  if (error.code === 11000) {
    error = new ErrorResponse(`Resource '${Object.values(error.keyValue)}' already exists`, 400)
  }
  // Validation errors
  if (err.name === 'ValidationError') {
    // @ts-ignore
    // const message: string = Object.values(err.errors).reduce((acc, curr) => curr.message, '')
    // error = new ErrorResponse(message, 400)
    const message: string = Object.values(err.errors).forEach(({ properties }) => {
      console.log(properties)
      error[properties.path] = properties.message
    })
    error.status = 400
  }
  // Express validator errors
  if (error.message === 'ValidationError') {
    error.message = error.errors.length === 1 ? error.errors[0] : error.errors
  }

  // console.error('errorHandler | error', error)
  return res.status(error.status || 500).json({
    success: false,
    error: error.message || 'Server Error',
  })
}

export default {
  logger: logger(),
  validateObjectId,
  setModel,
  asyncHandler,
  errorHandler,
}
