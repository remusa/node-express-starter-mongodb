import { NextFunction, Request, Response } from 'express'
import { Post } from './posts.model'
import { crudControllers } from '../../utils/crud'

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
    res.status(500).json({
      error: 'Server error',
    })
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

    if (err.code === 11000) {
      return res.status(400).json({
        error: 'Post already exists',
      })
    }

    res.status(500).json({
      error: `Server error: ${err.message}`,
    })
  }
}

const postControllers = crudControllers(Post)

export default {
  ...postControllers,
  getPosts,
  createPost,
}
