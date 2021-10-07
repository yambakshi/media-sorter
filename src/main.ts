import { env, logger } from '../config';
import { Arguments } from './enums';
import { createFolder, load, analyseFiles, sortFiles, scanFiles, revertSortFiles } from './services';


async function sort() {
    try {
        for (const path of env.folders) {
            const absPath = `${env.rootFolder}/${path}`;
            logger.info({ message: `Sorting files in '${absPath}'`, label: 'sort' });
            const data = load(path, Arguments.Sort) || await analyseFiles(path);
            (data && Object.keys(data).length !== 0) && sortFiles(data, absPath);
        }
    } catch (error) {
        logger.error({ message: error, label: 'sort' });
    }
}

async function revertSort() {
    try {
        for (const path of env.folders) {
            const absPath = `${env.rootFolder}/${path}`;
            logger.info({ message: `Reverting sort in '${absPath}'`, label: 'revertSort' });
            const data = load(path, Arguments.Sort);
            (data && Object.keys(data).length !== 0) && await revertSortFiles(data, absPath);
        }
    } catch (error) {
        logger.error({ message: error, label: 'revertSort' });
    }
}

function countFiles() {
    try {
        for (const path of env.folders) {
            const absPath = `${env.rootFolder}/${path}`;
            logger.info({ message: `Counting files in '${absPath}'`, label: 'countFiles' });
            const { files } = load(path, Arguments.CountFiles) || scanFiles(path);
            logger.info({ message: `Path '${absPath}' contains ${files.length} files`, label: 'countFiles' });
        }
    } catch (error) {
        logger.error({ message: error, label: 'countFiles' });
    }
}

async function main() {
    const argsLength = process.argv.length;
    const availableArgs = Object.values(Arguments);

    if (argsLength < 3) {
        logger.info({ message: `No argument was provided. available arguments: ${availableArgs.join(', ')}`, label: 'main' });
        return;
    }

    createFolder('caches');

    for (let i = 2; i < argsLength; i++) {
        const arg = process.argv[i];
        switch (arg) {
            case Arguments.Sort:
                await sort();
                break;
            case Arguments.RevertSort:
                await revertSort();
                break;
            case Arguments.CountFiles:
                countFiles();
                break;
            default:
                logger.info({ message: `Invalid argument '${arg}'. available arguments: ${availableArgs.join(', ')}`, label: 'main' });
                break;
        }
    }
}

main();