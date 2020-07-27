import express, { Router } from 'express'
import { getStores, postStore } from './stores.controllers'

const router: Router = express.Router()

router.route('/').get(getStores).post(postStore())

export default router
