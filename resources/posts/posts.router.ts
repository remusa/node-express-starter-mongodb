import { Router } from 'express'
import { ensureOwnerOrAdmin } from '../../utils/auth'
import middleware from '../../utils/middleware'
import controller from './posts.controllers'
import { Post } from './posts.model'

const router: Router = Router()

router.route('/').get(controller.getPosts()).post(controller.createPost())

router.use('/:id', [middleware.validateObjectId, middleware.setModel(Post), ensureOwnerOrAdmin])
router.route('/:id').get(controller.getOne).put(controller.updateOne).delete(controller.deleteOne)

export default router
