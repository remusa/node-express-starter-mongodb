import mongoose, { Document, Model, Schema } from 'mongoose'
import bcrypt from 'bcryptjs'

const SALT = bcrypt.genSaltSync(10)

interface IUser extends Document {
  email: string
  password: string
}

const UserSchema: Schema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email required'],
      unique: [true, 'Email already exists'],
      trim: true,
      maxlength: [50, 'Email must be less than 50 characters'],
    },
    password: {
      type: String,
      required: [true, 'Password required'],
      trim: true,
      minLength: [8, 'Password must be at least 8 characters'],
      maxlength: [50, 'Password must be less than 50 characters'],
    },
  },
  {
    timestamps: true,
  },
)

UserSchema.pre('save', async function (next: mongoose.HookNextFunction) {
  // if (!this.isModified('password')) {
  //   return next()
  // }

  const password = this.get('password')

  bcrypt.hash(password, SALT, (err, hash) => {
    if (err) {
      return next(err)
    }

    this.set('password', hash)

    next()
  })
})

UserSchema.methods.checkPassword = function (password: string) {
  const passwordHash = this.get('password')

  return new Promise((resolve, reject) => {
    bcrypt.compare(password, passwordHash, (err, same) => {
      if (err) {
        return reject(err)
      }

      resolve(same)
    })
  })
}

export const User: Model<IUser> = mongoose.model('User', UserSchema)
