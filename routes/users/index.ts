import express, { Router } from 'express'
import { getUsers, getUser, createUser, updateUser, deleteUser } from '../../controllers/users'

const router: Router = express.Router()

router.route('/').get(getUsers).post(createUser())

router.route('/:userId').get(getUser()).delete(deleteUser()).put(updateUser())

export default router
