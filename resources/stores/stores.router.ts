import { Router } from 'express'
import { getStores, postStore } from './stores.controllers'

const router: Router = Router()

router.route('/').get(getStores).post(postStore())

export default router
