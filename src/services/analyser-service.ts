import { env, logger } from '../../config';
import { getFilenames } from './fs-service';
import { getJPGMetadata, getVideoMetadata } from './metadata-service';
import { cache } from './cache-service';
import { sortDatetimeGPS, sortDatetime, sortGPS } from './sort-service';
import FileType from 'file-type';


const analysers: { [key: string]: Function } = {
    'jpg': analyseJPG,
    'mp4': analyseVideo,
    'mov': analyseVideo,
}

export async function analyseFiles(path: string) {
    const data = {}, absPath = `${env.galleryPath}/${path}`;        
    logger.info({ message: `Analysing files in '${absPath}'...`, label: 'analyseFiles' });

    const filenames = getFilenames(absPath);
    for (const filename of filenames) {
        logger.info({ message: `Analysing file '${filename}'...`, label: 'analyseFiles' });
        const filePath = `${absPath}/${filename}`;
        const fileType = (await FileType.fromFile(filePath)).ext;
        analysers[fileType] && await analysers[fileType](filePath, data);
    }

    logger.info({ message: `Analysed ${filenames.length} files`, label: 'analyseFiles' });
    cache(path, data);

    return data;
}

async function analyseJPG(filePath: string, data: {}): Promise<void> {
    const metadata = await getJPGMetadata(filePath);

    if (metadata.file.datetime && metadata.gps) {
        sortDatetimeGPS(metadata, data);
    } else if (metadata.file.datetime) {
        sortDatetime(metadata, data);
    } else if (metadata.gps) {
        sortGPS(metadata, data);
    } else {
        logger.info({ message: 'JPG file contains neither datetime nor GPS data', label: 'analyseJPG' });
        return;
    }

    logger.info({ message: 'Successfully analysed JPG file', label: 'analyseJPG' });
}

async function analyseVideo(filePath: string, data: {}): Promise<void> {
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