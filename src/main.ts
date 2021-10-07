import { env, logger } from '../config';
import { Arguments } from './enums';
import { createFolder, load, analyseFiles, sortFiles, scanPath } from './services';


async function sortMediaFiles() {
    try {
        for (const path of env.folders) {
            const absPath = `${env.rootFolder}/${path}`;
            logger.info({ message: `Sorting files in '${absPath}'`, label: 'sortMediaFiles' });
            const data = load(path, Arguments.SortMediaFiles) || await analyseFiles(path);
            (data && Object.keys(data).length !== 0) && sortFiles(data, absPath);
        }
    } catch (error) {
        logger.error({ message: error, label: 'sortMedia' });
    }
}

function reverseSortMediaFiles() {
    try {
    } catch (error) {
        logger.error({ message: error, label: 'reverseSortMediaFiles' });
    }
}

function countFiles() {
    try {
        for (const path of env.folders) {
            const absPath = `${env.rootFolder}/${path}`;
            logger.info({ message: `Counting files in '${absPath}'`, label: 'countFiles' });
            const { files } = load(path, Arguments.CountFiles) || scanPath(path);
            logger.info({ message: `Path '${absPath}' contains ${files.length} files`, label: 'countFiles' });
        }
    } catch (error) {
        logger.error({ message: error, label: 'countFiles' });
    }
}

async function main() {
    const argsLength = process.argv.length;
    const availableArgs = Object.values(Arguments);

    if (process.argv.length < 3) {
        logger.info({ message: `No argument was provided. available arguments: ${availableArgs.join(',')}`, label: 'main' });
        return;
    }

    createFolder('caches');

    for (let i = 2; i < argsLength; i++) {
        const arg = process.argv[i];
        switch (arg) {
            case Arguments.SortMediaFiles:
                await sortMediaFiles();
                break;
            case Arguments.ReverseSortMediaFiles:
                reverseSortMediaFiles();
                break;
            case Arguments.CountFiles:
                countFiles();
                break;
            default:
                logger.info({ message: `Invalid argument '${arg}'. available arguments: ${availableArgs.join(',')}`, label: 'main' });
                break;
        }
    }
}

main();