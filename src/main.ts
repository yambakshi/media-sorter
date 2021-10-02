import { env } from '../config';
import { createFolder, load, analyseFiles, sortFiles } from './services';
import { logger } from '../config/logger';


async function main() {
    try {
        createFolder('caches');

        for (const { path, cache } of env.folders) {
            const data = load(cache) || await analyseFiles(path, cache);
            (data && Object.keys(data).length === 0) || sortFiles(data, path);
        }
    } catch (error) {
        logger.error({ message: error, label: 'main' });
    }
}

main();