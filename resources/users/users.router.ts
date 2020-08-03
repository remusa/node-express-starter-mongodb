import { Router } from 'express'
import controller from './users.controllers'

const router: Router = Router()

router.route('/me').get(controller.getMe()).put(controller.updateMe())

router.route('/').get(controller.getMany).post(controller.createOne)

router.route('/:id').get(controller.getOne).delete(controller.deleteOne).put(controller.updateOne)

export default router
