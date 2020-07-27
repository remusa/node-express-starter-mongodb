import mongoose, { Schema, Model, Document } from 'mongoose'
import geocoder from '../utils/geocoder'

interface IStore extends Document {
  storeId: string
  address: string
  location: {
    type: string
    coordinates: number
    formattedAddress: string
  }
  createdAt: Date
}

const StoreSchema: Schema = new mongoose.Schema({
  storeId: {
    type: String,
    required: [true, 'Please add a storeID'],
    unique: true,
    trim: true,
    maxlength: [10, 'Store ID must be less than 10 characters'],
  },
  address: {
    type: String,
    required: [true, 'Please add an address'],
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      // required: [true, ''],
    },
    coordinates: {
      type: [Number],
      // required: [true, ''],
      index: '2dsphere',
    },
    formattedAddress: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

// Geocode & create location
StoreSchema.pre('save', async function (next: mongoose.HookNextFunction) {
  const loc = await geocoder.geocode(this.get('address'))

  this.set({
    location: {
      type: 'Point',
      coordinates: [loc[0].longitude, loc[0].latitude],
      formattedAddress: loc[0].formattedAddress,
    },
    // Don't save address
    address: undefined,
  })

  next()
})

// Exports
export const Store: Model<IStore> = mongoose.model('Store', StoreSchema)
