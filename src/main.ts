import { env, logger } from '../config';
import { Arguments } from './enums';
import { createFolder, load, analyseFiles, scanFiles, reorganize } from './services';


async function sort(revert: boolean = false): Promise<void> {
    try {
        for (const path of env.folders) {
            const absPath = `${env.rootFolder}/${path}`;
            logger.info({ message: `Sorting files in '${absPath}'`, label: 'sort' });
            const data = load(path, Arguments.Sort) || (!revert && await analyseFiles(path));
            (data && Object.keys(data).length !== 0) && await reorganize(data, absPath, revert);
        }
    } catch (error) {
        logger.error({ message: error, label: 'sort' });
    }
}

function countFiles(): void {
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
    const availableArgs = `available arguments: ${Object.values(Arguments).join(', ')}`;

    if (argsLength < 3) {
        logger.info({ message: `No argument was provided. ${availableArgs}`, label: 'main' });
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
                await sort(true);
                break;
            case Arguments.CountFiles:
                countFiles();
                break;
            default:
                logger.info({ message: `Invalid argument '${arg}'. ${availableArgs}`, label: 'main' });
                break;
        }
    }
}

main();