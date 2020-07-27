import NodeGeocoder from 'node-geocoder'
import dotenv from 'dotenv'

dotenv.config({
  path: './config/.env.dev',
})

const GEOCODER_PROVIDER = process.env.GEOCODER_PROVIDER
const GEOCODER_API_KEY = process.env.GEOCODER_API_KEY

// https://github.com/nchaulet/node-geocoder
const options: NodeGeocoder.Options = {
  // @ts-ignore
  provider: GEOCODER_PROVIDER,

  // Optional depending on the providers
  httpAdapter: 'https', // Default
  // fetch: customFetchImplementation,
  apiKey: GEOCODER_API_KEY, // for Mapquest, OpenCage, Google Premier
  formatter: null, // 'gpx', 'string', ...
}

const geocoder: NodeGeocoder.Geocoder = NodeGeocoder(options)

export default geocoder
