import express, { Router } from 'express'
import { getUsers, postUser } from '../../controllers/users'

const router: Router = express.Router()

router.route('/').get(getUsers).post(postUser)

export default router
