import { Model, model, Schema } from 'mongoose'

export interface IPost extends Document {
  user: any
  title: string
  text: string
}

const PostSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
    },
    title: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
)

export const Post: Model<IPost> = model('Post', PostSchema)
