import { env, logger } from '../../config';
import { createFolder, removeFolder, renameFile } from './fs-service';
import { JPGMetadata } from '../models';


const zipcodesRegexes: { [key: string]: RegExp[] } = {
    "Portugal": [/\d{4}(?:[-\s]\d{3})?/, /[A-Z0-9]{4}\+[A-Z0-9]{2}/],
    "Spain": [/\d{5}/, /[A-Z0-9]{4}\+[A-Z0-9]{2}/]
}

function removeZipcode(country: string, cityWithZip: string): string {
    let city = cityWithZip;
    zipcodesRegexes[country].forEach(regex => city = city.replace(regex, ''));
    return city.trim();
}

function reorganizeFiles(data: any, parentFolder: string, revert: boolean = false): void {
    if (Array.isArray(data)) {
        for (const { file } of data) {
            const pathParts = file.path.split('/');
            const filename = pathParts[pathParts.length - 1];
            const newPath = `${parentFolder}/${filename}`;
            revert ? renameFile(newPath, file.path) : renameFile(file.path, newPath);
        }
    } else {
        Object.keys(data).forEach(level => {
            const newFolder = `${parentFolder}/${level}`;
            !revert && createFolder(newFolder);
            reorganizeFiles(data[level], newFolder, revert);
        });
    }
}

export function sortDatetimeGPS(metadata: JPGMetadata, data: {}): void {
    logger.info({ message: 'Photo contains datetime and GPS data', label: 'datetimeGPSSort' });

    const date = metadata.file.datetime.split(' ')[0].replace(/\:/g, '-');
    const [country, cityWithZip] = metadata.gps.address.split(', ').reverse();

    if (!data[date]) {
        data[date] = {};
    }

    if (!data[date][country]) {
        data[date][country] = {};
    }

    const city = removeZipcode(country, cityWithZip);
    if (!data[date][country][city]) {
        const duplicateCity = Object.keys(data[date][country]).find(city => city.toUpperCase() === city.toUpperCase());
        if (!duplicateCity) {
            data[date][country][city] = [];
            data[date][country][city].push(metadata);
        } else {
            data[date][country][duplicateCity].push(metadata);
        }
    } else {
        data[date][country][city].push(metadata);
    }
}

export function sortDatetime(metadata: JPGMetadata, data: {}): void {
    logger.info({ message: 'Photo contains only datetime data', label: 'datetimeSort' });

    const date = metadata.file.datetime.split(' ')[0].replace(/\:/g, '-');

    if (!data[date]) {
        data[date] = [];
    }

    data[date].push(metadata);
}

export function sortGPS(metadata: JPGMetadata, data: {}): void {
    logger.info({ message: 'Photo contains only GPS data', label: 'GPSSort' });

    const [country, cityWithZip] = metadata.gps.address.split(', ').reverse();
    if (!data[country]) {
        data[country] = {};
    }

    const city = removeZipcode(country, cityWithZip);
    if (!data[country][city]) {
        const duplicateCity = Object.keys(data[country]).find(city => city.toUpperCase() === city.toUpperCase());
        if (!duplicateCity) {
            data[country][city] = [];
            data[country][city].push(metadata);
        } else {
            data[country][duplicateCity].push(metadata);
        }
    } else {
        data[country][city].push(metadata);
    }
}

export function reorganize(data: {}, path: string): void {
    logger.info({ message: `Reorganizing files in '${path}'`, label: 'reorganize' });
    reorganizeFiles(data, path);
    logger.info({ message: 'Successfully reorganized files', label: 'reorganize' });
}

export async function revertReorganize(data: {}, path: string): Promise<void> {
    logger.info({ message: `Reverting reorganization in '${path}'`, label: 'revertReorganize' });

    reorganizeFiles(data, path, true);

    // Delete sort folders
    const parentFolders = Object.keys(data);
    for (const folder of parentFolders) {
        const folderPath = `${path}/${folder}`;
        logger.info({ message: `Deleting folder '${folderPath}'`, label: 'revertReorganize' });
        await removeFolder(folderPath);
    }

    logger.info({ message: 'Successfully reverted reorganization', label: 'revertReorganize' });
}