import { config } from './configService'
import axios from 'axios'

interface GeocodingResponse {
  results: Array<{
    formatted_address: string
    types: string[]
    geometry: {
      location: {
        lat: number
        lng: number
      }
    }
  }>
  status: string
}

export class LocationService {
  private readonly apiKey: string
  private readonly baseUrl: string

  constructor() {
    this.apiKey = config.location.google.apiKey
    this.baseUrl = config.location.google.baseUrl
  }

  public async getFullAddress(lat: number, lng: number): Promise<string | null> {
    try {
      const response = await axios.get<GeocodingResponse>(this.baseUrl, {
        params: {
          latlng: `${lat},${lng}`,
          key: this.apiKey,
          result_type: 'street_address',
        },
      })

      if (response.data.status === 'OK' && response.data.results.length > 0) {
        return response.data.results[0].formatted_address
      }
      return null
    } catch (error) {
      console.error('Error getting address from Google Maps:', error)
      return null
    }
  }

  public async getCoordinates(
    address1: string,
    address2: string | null,
    city: string,
    zipCode: string
  ): Promise<{ latitude: number; longitude: number } | null> {
    try {
      // Build the full address string
      const fullAddress = `${address1}${address2 ? ', ' + address2 : ''}, ${city}, ${zipCode}`

      console.log('LocationService: Calling Google API with:', {
        fullAddress,
        apiKey: this.apiKey ? 'present' : 'missing',
      })

      const response = await axios.get<GeocodingResponse>(this.baseUrl, {
        params: {
          address: fullAddress,
          key: this.apiKey,
        },
      })

      console.log('LocationService: Google API response status:', response.data.status)

      if (response.data.status === 'OK' && response.data.results.length > 0) {
        const location = response.data.results[0].geometry.location
        console.log('LocationService: Coordinates found:', location)
        return {
          latitude: location.lat,
          longitude: location.lng,
        }
      }
      console.log('LocationService: No results or status not OK')
      return null
    } catch (error) {
      console.error('Error getting coordinates from Google Maps:', error)
      return null
    }
  }
}
