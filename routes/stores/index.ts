import express, { Router } from 'express'
import { getStores, postStore } from '../../controllers/stores'

const router: Router = express.Router()

router.route('/').get(getStores).post(postStore())

export default router
