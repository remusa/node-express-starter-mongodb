// @ts-ignore
import pinoNoir from 'pino-noir'
import pinoLogger from 'express-pino-logger'
import { STATUS_CODES } from 'http'
import mongoose, { Model } from 'mongoose'
import { Request, Response, NextFunction } from 'express'

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
    return res.status(404).send({ success: false, error: 'Invalid resource id' })
  }

  next()
}

const setModel = (model: any) => (req: Request, res: Response, next: NextFunction) => {
  // @ts-ignore
  req.model = model

  next()
}

export default {
  logger: logger(),
  validateObjectId,
  setModel,
  // notFound,
  // handleError,
  // handleValidationError,
}
