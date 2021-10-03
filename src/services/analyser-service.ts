import { getFilenames } from './fs-service';
import { getJPGMetadata, getVideoMetadata } from './metadata-service';
import { cache } from './cache-service';
import { datetimeGPSSort, datetimeSort, GPSSort } from './sort-service';
import FileType from 'file-type';
import { logger } from '../../config/logger';


const analysers = {
    'jpg': analyseJPG,
    'mp4': analyseVideo,
    'mov': analyseVideo,
}

export async function analyseFiles(parentFolder, cachePath) {
    const data = {}, filenames = getFilenames(parentFolder);
    logger.info({ message: `Analysing ${filenames.length} files...`, label: 'analyseFiles' });

    for (const filename of filenames) {
        logger.info({ message: `Analysing file '${filename}'...`, label: 'analyseFiles' });
        const filePath = `${parentFolder}/${filename}`;
        const fileType = (await FileType.fromFile(filePath)).ext;
        analysers[fileType] && await analysers[fileType](filePath, data);
    }

    logger.info({ message: `Analysed ${filenames.length} files`, label: 'analyseFiles' });
    cache(cachePath, data);

    return data;
}

async function analyseJPG(filePath, data) {
    const metadata = await getJPGMetadata(filePath);

    if (metadata.file.datetime && metadata.gps) {
        datetimeGPSSort(metadata, data);
    } else if (metadata.file.datetime) {
        datetimeSort(metadata, data);
    } else if (metadata.gps) {
        GPSSort(metadata, data);
    } else {
        logger.info({ message: 'JPG file contains neither datetime nor GPS data', label: 'analyseFiles' });
        return;
    }

    logger.info({ message: 'Successfully analysed JPG file', label: 'analyseJPG' });
}

async function analyseVideo(filePath, data) {
    const metadata = await getVideoMetadata(filePath);

    if (!metadata.file.datetime) {
        logger.info({ message: 'Video file doesn\'t contain datetime data', label: 'analyseVideo' });
        return;
    }

    const date = metadata.file.datetime.match(/\d{4}-\d{2}-\d{2}/)[0];
    if (!data[date]) {
        data[date] = [];
    }

    data[date].push(metadata);
    logger.info({ message: 'Successfully analysed video file', label: 'analyseVideo' });
}