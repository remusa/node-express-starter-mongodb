import { Model, model, Schema, Document } from 'mongoose'

export interface IPost extends Document {
  title: string
  content: string
  createdBy: any
}

const PostSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  },
)

export const Post: Model<IPost> = model('Post', PostSchema)
