import piexif from 'piexifjs';
import ffprobe from 'ffprobe';
import ffprobeStatic from 'ffprobe-static';
import { resolveAddress } from './gps-service';
import { getBase64DataFromFile, getFileSize } from './fs-service';


function printExif(exif) {
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

function calcCoordinates(exif) {
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

function getDeviceData(exif) {
    if (!!exif['0th'] && Object.keys(exif['0th']).length === 0) {
        return;
    }

    return {
        manufacturer: exif['0th'][piexif.ImageIFD.Make],
        model: exif['0th'][piexif.ImageIFD.Model],
        os: exif['0th'][piexif.ImageIFD.Software]
    }
}

function getFileData(exif, path) {
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

async function getGPSData(exif) {
    if (!!exif['GPS'] && Object.keys(exif['GPS']).length === 0) {
        return;
    }

    const latlng = calcCoordinates(exif);
    const address = await resolveAddress(latlng);

    return { latlng, address };
}

export async function getJPGMetadata(photoPath) {
    const exif = piexif.load(getBase64DataFromFile(photoPath));
    const device = getDeviceData(exif);
    const file = getFileData(exif, photoPath);
    const gps = await getGPSData(exif);

    return { device, file, gps };
}

export async function getVideoMetadata(path) {
    const metadata = await ffprobe(path, { path: ffprobeStatic.path });
    const datetime = metadata.streams[0].tags.creation_time;
    const file = { datetime, path };
    return { file };
}