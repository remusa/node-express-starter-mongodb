// @ts-ignore
import pinoNoir from 'pino-noir'
import pinoLogger from 'express-pino-logger'
import { STATUS_CODES } from 'http'

function logger() {
  return pinoLogger({
    serializers: pinoNoir([
      'res.headers.set-cookie',
      'req.headers.cookie',
      'req.headers.authorization',
    ]),
  })
}

export default {
  logger: logger(),
  // notFound,
  // handleError,
  // handleValidationError,
}
