import { env, logger } from '../config';
import { createFolder, load, analyseFiles, sortFiles, countFilesRecursively } from './services';


async function sortMediaFiles() {
    try {
        createFolder('caches');

        for (const path of env.folders) {
            logger.info({ message: `Sorting files in '${path}'`, label: 'sortMediaFiles' });
            const data = load(path) || await analyseFiles(path);
            (data && Object.keys(data).length !== 0) && sortFiles(data, path);
        }
    } catch (error) {
        logger.error({ message: error, label: 'sortMedia' });
    }
}

function reverseSort() {
}

function countFiles() {
    try {
        createFolder('caches');

        for (const path of env.folders) {
            const absPath = `${env.galleryPath}/${path}`;

            logger.info({ message: `Counting files in '${absPath}'`, label: 'countFiles' });
            const result = countFilesRecursively(absPath);
            logger.info({ message: `Path '${absPath}' contains ${result} files`, label: 'countFiles' });
        }
    } catch (error) {
        logger.error({ message: error, label: 'countFiles' });
    }
}

async function main() {
    const argsLength = process.argv.length;
    if (process.argv.length < 3) {
        logger.info({ message: "No option was passed. available options are: 'sort-files', 'reverse-sort', 'count-files'", label: 'main' });
        return;
    }

    for (let i = 2; i < argsLength; i++) {
        const arg = process.argv[i];
        switch (arg) {
            case 'sort-files':
                await sortMediaFiles();
                break;
            case 'reverse-sort':
                reverseSort();
                break;
            case 'count-files':
                countFiles();
                break;
            default:
                logger.info({ message: `'${arg}' is not an option. available options are: 'sort-files', 'reverse-sort', 'count-files'`, label: 'main' });
                break;
        }
    }
}

main();