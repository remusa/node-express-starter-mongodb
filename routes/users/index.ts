import express, { Router } from 'express'
import { getUsers, getUser, createUser } from '../../controllers/users'

const router: Router = express.Router()

router.route('/').get(getUsers).post(createUser())

router.route('/id').get(getUser())

export default router
