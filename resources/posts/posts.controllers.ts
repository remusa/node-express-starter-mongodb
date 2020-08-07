import { NextFunction, Request, Response } from 'express'
import { crudControllers } from '../../utils/crud'
import { Post } from './posts.model'
import ErrorResponse from '../../utils/error'

// @desc Get all posts
// @route GET /api/v1/posts
// @access Public
const getPosts = () => async (req: Request, res: Response, next: NextFunction) => {
  try {
    // @ts-ignore
    const posts = await Post.find({ createdBy: req.user._id }).exec()

    return res.status(200).json({
      success: true,
      count: posts.length,
      data: posts,
    })
  } catch (err) {
    console.error(`Error getting posts: ${err.message}`)

    next(err)
  }
}

// @desc Create a post
// @route POST /api/v1/posts
// @access Public
const createPost = () => async (req: Request, res: Response, next: NextFunction) => {
  try {
    // @ts-ignore
    const newPost = { ...req.body, createdBy: req.user._id }

    const post = await Post.create(newPost)

    return res.status(201).json({
      success: true,
      data: post,
    })
  } catch (err) {
    console.error(`Error posting post: ${err.message}`)

    next(err)
  }
}

const postControllers = crudControllers(Post)

export default {
  ...postControllers,
  getPosts,
  createPost,
}
