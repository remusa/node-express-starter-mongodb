import mongoose, { Mongoose } from 'mongoose'

const connectDB = async (DB_URL: string) => {
  try {
    const conn: Mongoose = await mongoose.connect(DB_URL, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false,
      useUnifiedTopology: true,
    })

    console.log(`Database connected: ${conn.connection.host}`)
  } catch (error) {
    console.error(`Database error: ${error}`)
    // Exit app with failure
    process.exit(1)
  }
}

export default connectDB
