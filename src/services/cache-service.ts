import { writeFile, readFile } from './fs-service';
import { logger } from '../../config/logger';


export function load(path) {
    logger.info({ message: 'Loading cache...', label: 'load' });
    const cache = JSON.parse(readFile(`caches/${path}`));
    logger.info({ message: cache ? 'Successfully loaded cache' : 'No cache was found', label: 'load' });

    return cache;
}

export function cache(path, data) {
    logger.info({ message: 'Caching analysis results...', label: 'cache' });

    let message = 'Successfully cached';
    if (data && Object.keys(data).length !== 0) {
        writeFile(`caches/${path}`, JSON.stringify(data));
    } else {
        message = 'Nothing to cache';
    }

    logger.info({ message, label: 'cache' });
}