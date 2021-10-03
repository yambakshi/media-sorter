import { writeFile, readFile, createFolder } from './fs-service';
import { logger } from '../../config/logger';


export function load(path: string) {
    const cachePath = `caches/${path}/cache.json`;

    logger.info({ message: `Loading cache '${cachePath}'...`, label: 'load' });
    const cache = JSON.parse(readFile(cachePath));
    logger.info({ message: cache ? 'Successfully loaded cache' : 'No cache was found', label: 'load' });

    return cache;
}

export function cache(path: string, data): void {
    const cacheFolder = `caches/${path}`;
    createFolder(cacheFolder, true);

    const cachePath = `${cacheFolder}/cache.json`;
    logger.info({ message: `Caching analysis results in '${cachePath}'...`, label: 'cache' });

    let message = 'Successfully cached';
    if (data && Object.keys(data).length !== 0) {
        writeFile(cachePath, JSON.stringify(data));
    } else {
        message = 'Nothing to cache';
    }

    logger.info({ message, label: 'cache' });
}