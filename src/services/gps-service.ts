import { Client } from "@googlemaps/google-maps-services-js";
import { env } from '../../config';
const client = new Client({});

export async function resolveAddress(latlng) {
    const res = await client.reverseGeocode({ params: { latlng, key: env.apiKey } });
    const address = res.data.results[0].formatted_address;

    return address;
}