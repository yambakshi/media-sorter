import { writeFile, readFile, createFolder } from './fs-service';
import { logger } from '../../config/logger';
import { Arguments } from '../enums';


export function load(path: string, arg: Arguments): { files?: string[] } {
    const cachePath = `caches/${path}/${arg}.json`;

    logger.info({ message: `Loading cache '${cachePath}'...`, label: 'load' });
    const cache = JSON.parse(readFile(cachePath) as string);
    logger.info({ message: cache ? 'Successfully loaded cache' : 'No cache was found', label: 'load' });

    return cache;
}

export function cache(path: string, arg: Arguments, data: {}): void {
    if (!data || Object.keys(data).length == 0) {
        logger.info({ message: 'Nothing to cache', label: 'cache' });
        return;
    }

    const cacheFolder = `caches/${path}`;
    createFolder(cacheFolder, true);

    const cachePath = `${cacheFolder}/${arg}.json`;
    logger.info({ message: `Caching results in '${cachePath}'...`, label: 'cache' });

    writeFile(cachePath, JSON.stringify(data));
    logger.info({ message: 'Successfully cached', label: 'cache' });
}