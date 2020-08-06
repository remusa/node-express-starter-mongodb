import { Router } from 'express'
import controller from './users.controllers'
import { ensureAdmin } from '../../utils/auth'

const router: Router = Router()

router.route('/me').get(controller.getMe()).put(controller.updateMe())

router.use('/', ensureAdmin)
router.route('/').get(controller.getMany).post(controller.createOne)
router.route('/:id').get(controller.getOne).put(controller.updateOne).delete(controller.deleteOne)

export default router
