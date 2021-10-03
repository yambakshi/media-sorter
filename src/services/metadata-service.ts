import piexif from 'piexifjs';
import ffprobe from 'ffprobe';
import ffprobeStatic from 'ffprobe-static';
import { resolveAddress } from './gps-service';
import { getBase64DataFromFile, getFileSize } from './fs-service';
import { LatLng } from '@googlemaps/google-maps-services-js';
import { DeviceData, FileData, GPSData, JPGMetadata, VideoMetadata } from '../models';


function printExif(exif): void {
    for (const ifd in exif) {
        if (ifd == 'thumbnail') {
            const thumbnailData = exif[ifd] === null ? "null" : exif[ifd];
            console.log(`- thumbnail: ${thumbnailData}`);
        } else {
            console.log(`- ${ifd}`);
            for (const tag in exif[ifd]) {
                console.log(`    - ${piexif.TAGS[ifd][tag]['name']}: ${exif[ifd][tag]}`);
            }
        }
    }
}

function calcCoordinates(exif): number[] {
    const latitude = exif['GPS'][piexif.GPSIFD.GPSLatitude];
    const latitudeRef = exif['GPS'][piexif.GPSIFD.GPSLatitudeRef];
    const longitude = exif['GPS'][piexif.GPSIFD.GPSLongitude];
    const longitudeRef = exif['GPS'][piexif.GPSIFD.GPSLongitudeRef];

    const latitudeMultiplier = latitudeRef == 'N' ? 1 : -1;
    const decimalLatitude = latitudeMultiplier * piexif.GPSHelper.dmsRationalToDeg(latitude);
    const longitudeMultiplier = longitudeRef == 'E' ? 1 : -1;
    const decimalLongitude = longitudeMultiplier * piexif.GPSHelper.dmsRationalToDeg(longitude);


    return [decimalLatitude, decimalLongitude];
}

function getDeviceData(exif): DeviceData {
    if (!!exif['0th'] && Object.keys(exif['0th']).length === 0) {
        return;
    }

    return {
        manufacturer: exif['0th'][piexif.ImageIFD.Make],
        model: exif['0th'][piexif.ImageIFD.Model],
        os: exif['0th'][piexif.ImageIFD.Software]
    }
}

function getFileData(exif, path): FileData {
    return {
        path,
        datetime: exif['Exif'][piexif.ExifIFD.DateTimeOriginal],
        size: getFileSize(path),
        resolution: {
            width: exif['Exif'][piexif.ExifIFD.PixelXDimension],
            height: exif['Exif'][piexif.ExifIFD.PixelYDimension]
        }
    }
}

async function getGPSData(exif): Promise<GPSData> {
    if (!!exif['GPS'] && Object.keys(exif['GPS']).length === 0) {
        return;
    }

    const latlng = calcCoordinates(exif);
    const address = await resolveAddress(latlng as LatLng);

    return { latlng, address };
}

export async function getJPGMetadata(path: string): Promise<JPGMetadata> {
    const exif = piexif.load(getBase64DataFromFile(path));
    const device = getDeviceData(exif);
    const file = getFileData(exif, path);
    const gps = await getGPSData(exif);

    return { device, file, gps };
}

export async function getVideoMetadata(path: string): Promise<VideoMetadata> {
    const metadata = await ffprobe(path, { path: ffprobeStatic.path });
    const datetime = metadata.streams[0].tags.creation_time;
    const file = { datetime, path };

    return { file };
}