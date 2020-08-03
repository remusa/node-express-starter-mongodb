import bcrypt from 'bcryptjs'
import mongoose, { Document, Model, model, Schema } from 'mongoose'
import validator from 'validator'

const BCRYPT_SALT = bcrypt.genSaltSync(10)

export interface IUser extends Document {
  email: string
  password: string
  username?: string
  checkPassword: (password: string) => boolean
}

const UserSchema: Schema = new Schema(
  {
    email: {
      type: String,
      required: [true, 'Email required'],
      unique: [true, 'Email already exists'],
      lowercase: true,
      trim: true,
      validate: [validator.isEmail, 'Invalid email address'],
      minlength: [5, 'Email must be at least 5 characters'],
      maxlength: [50, 'Email must be less than 50 characters'],
    },
    password: {
      type: String,
      required: [true, 'Password required'],
      trim: true,
      minLength: [8, 'Password must be at least 8 characters'],
      maxlength: [50, 'Password must be less than 50 characters'],
      // select: false,
    },
    username: {
      type: String,
      trim: true,
      required: false,
      default: '',
      minLength: [3, 'Username must be at least 3 characters'],
      maxlength: [16, 'Username must be less than 16 characters'],
    },
  },
  {
    timestamps: true,
  },
)

UserSchema.pre('save', async function (next: mongoose.HookNextFunction) {
  if (!this.isModified('password')) {
    return next()
  }

  const password = this.get('password')

  const hash = await bcrypt.hash(password, BCRYPT_SALT)
  this.set({ password: hash })

  next()
})

UserSchema.methods.checkPassword = async function (password: string) {
  const passwordHash = this.get('password')

  const match = await bcrypt.compare(password, passwordHash)

  return match
}

export const User: Model<IUser> = model('User', UserSchema)
