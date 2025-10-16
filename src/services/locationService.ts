import { config } from './configService';
import axios from 'axios'

interface GeocodingResponse {
    results: Array<{
        formatted_address: string;
        types: string[];
    }>;
    status: string;
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
}