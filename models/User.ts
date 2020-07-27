import mongoose, { Schema, Model, Document } from 'mongoose'

interface IUser extends Document {
  email: string
  password: string
  // createdAt: Date
}

const UserSchema: Schema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Please include an email'],
      trim: true,
      maxlength: [50, 'Email must be less than 50 characters'],
    },
    password: {
      type: String,
      required: [true, 'Please enter a valid password'],
      trim: true,
      minLength: [8, 'Password must be at least 8 characters'],
      maxlength: [50, 'Password must be less than 50 characters'],
    },
    // createdAt: {
    //   type: Date,
    //   default: Date.now,
    // },
  },
  {
    timestamps: true,
  },
)

export const User: Model<IUser> = mongoose.model('User', UserSchema)
