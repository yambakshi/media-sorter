import { env, logger } from '../config';
import { createFolder, load, analyseFiles, sortFiles, countFilesRecursively } from './services';


async function sortMedia() {
    try {
        createFolder('caches');

        for (const path of env.folders) {
            const data = load(path) || await analyseFiles(path);
            (data && Object.keys(data).length !== 0) && sortFiles(data, path);
        }
    } catch (error) {
        logger.error({ message: error, label: 'sortMedia' });
    }
}

function countFiles() {
    try {
        createFolder('caches');

        for (const path of env.folders) {
            // const result = countFilesRecursively(`${env.galleryPath}/${path}`);
            const result = countFilesRecursively('D:/Yam Bakshi/Careers/Music/Marketing/PR/Photoshoots/2021-09-01 - Portugal & Spain Family Trip');
            logger.info({ message: `Path '${path}' contains ${result} files`, label: 'countFiles' });
        }
    } catch (error) {
        logger.error({ message: error, label: 'countFiles' });
    }
}

async function main() {
    switch (process.argv[2]) {
        case 'count':
            countFiles();
            break;
        default:
            sortMedia();
    }
}

main();