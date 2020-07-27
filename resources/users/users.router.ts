import express, { Router } from 'express'
import { getUsers, getUser, createUser, updateUser, deleteUser } from './users.controllers'

const router: Router = express.Router()

router.route('/').get(getUsers).post(createUser())

router.route('/:userId').get(getUser()).delete(deleteUser()).put(updateUser())

export default router
