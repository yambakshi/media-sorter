import { logger } from '../../config/logger';
import { createFolder, renameFile } from './fs-service';


const zipcodesRegexes = {
    "Portugal": [/\d{4}(?:[-\s]\d{3})?/, /[A-Z0-9]{4}\+[A-Z0-9]{2}/],
    "Spain": [/\d{5}/, /[A-Z0-9]{4}\+[A-Z0-9]{2}/]
}

export function datetimeGPSSort(exif, data) {
    logger.info({ message: 'Photo contains datetime and GPS data', label: 'datetimeGPSSort' });

    const date = exif.file.datetime.split(' ')[0].replace(/\:/g, '-');
    const [country, cityWithZip] = exif.gps.address.split(', ').reverse();

    if (!data[date]) {
        data[date] = {};
    }

    if (!data[date][country]) {
        data[date][country] = {};
    }

    let city = cityWithZip;
    zipcodesRegexes[country].forEach(regex => city = city.replace(regex, ''));
    city = city.trim();

    if (!data[date][country][city]) {
        const duplicateCity = Object.keys(data[date][country]).find(city => city.toUpperCase() === city.toUpperCase());
        if (!duplicateCity) {
            data[date][country][city] = [];
            data[date][country][city].push(exif);
        } else {
            data[date][country][duplicateCity].push(exif);
        }
    } else {
        data[date][country][city].push(exif);
    }
}

export function datetimeSort(exif, data) {
    logger.info({ message: 'Photo contains only datetime data', label: 'datetimeSort' });

    const date = exif.file.datetime.split(' ')[0].replace(/\:/g, '-');

    if (!data[date]) {
        data[date] = [];
    }

    data[date].push(exif);
}

export function GPSSort(exif, data) {
    logger.info({ message: 'Photo contains only GPS data', label: 'GPSSort' });

    const [country, cityWithZip] = exif.gps.address.split(', ').reverse();
    if (!data[country]) {
        data[country] = {};
    }

    let city = cityWithZip;
    zipcodesRegexes[country].forEach(regex => city = city.replace(regex, ''));
    city = city.trim();

    if (!data[country][city]) {
        const duplicateCity = Object.keys(data[country]).find(city => city.toUpperCase() === city.toUpperCase());
        if (!duplicateCity) {
            data[country][city] = [];
            data[country][city].push(exif);
        } else {
            data[country][duplicateCity].push(exif);
        }
    } else {
        data[country][city].push(exif);
    }
}

function reorganizeFiles(data, parentFolder) {
    if (Array.isArray(data)) {
        for (const { file } of data) {
            const pathArray = file.path.split('/');
            const filename = pathArray[pathArray.length - 1];
            const newPath = `${parentFolder}/${filename}`;
            renameFile(file.path, newPath);
        }
    } else {
        Object.keys(data).forEach(level => {
            const newFolder = `${parentFolder}/${level}`;
            createFolder(newFolder);
            reorganizeFiles(data[level], newFolder);
        });
    }
}

export function sortFiles(data, path) {
    logger.info({ message: 'Sorting files', label: 'sortFiles' });
    reorganizeFiles(data, path);
    logger.info({ message: 'Successfully sorted files', label: 'sortFiles' });
}