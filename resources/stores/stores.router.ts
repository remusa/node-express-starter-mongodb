import { Router } from 'express'
import middleware from '../../utils/middleware'
import controller from './stores.controllers'

const router: Router = Router()

router.route('/').get(controller.getStores()).post(controller.postStore())

router.use('/:id', [middleware.validateObjectId])
router.route('/:id').get(controller.getOne).put(controller.updateOne).delete(controller.deleteOne)

export default router
