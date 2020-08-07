import { Router } from 'express'
import controller from './users.controllers'
import { ensureAdmin } from '../../utils/auth'
import middleware from '../../utils/middleware'

const router: Router = Router()

router.route('/me').get(controller.getMe()).put(controller.updateMe())

router.use('/', ensureAdmin)

router.route('/').get(controller.getMany).post(controller.createOne)

router.use('/:id', [middleware.validateObjectId])
router.route('/:id').get(controller.getOne).put(controller.updateOne).delete(controller.deleteOne)

export default router
