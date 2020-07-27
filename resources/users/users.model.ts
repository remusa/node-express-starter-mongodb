import mongoose, { Document, Model, Schema } from 'mongoose'

interface IUser extends Document {
  email: string
  password: string
}

const UserSchema: Schema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Please include an email'],
      unique: [true, 'Email already exists'],
      trim: true,
      maxlength: [50, 'Email must be less than 50 characters'],
    },
    password: {
      type: String,
      required: [true, 'Invalid credentials'],
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
  const passwordHash = 'hashedPassword'

  this.set({
    password: passwordHash,
  })

  next()
})

export const User: Model<IUser> = mongoose.model('User', UserSchema)
