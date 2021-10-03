import { Client, LatLng } from "@googlemaps/google-maps-services-js";
import { env } from '../../config';
import { logger } from "../../config/logger";
const client = new Client({});


export async function resolveAddress(latlng: LatLng): Promise<string> {
    try {
        const res = await client.reverseGeocode({ params: { latlng, key: env.apiKey } });
        const address = res.data.results[0].formatted_address;
    
        return address;
    } catch (error) {
        logger.error({ message: error, label: 'resolveAddress' });
    }
}