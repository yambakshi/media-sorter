import { env, logger } from "../../config";
import { Arguments } from "../enums";
import { cache } from "./cache-service";

const fs = require('fs');


export enum FilterType { IsFile, IsDirectory };

export function getFilenames(path: string, filterType: FilterType = FilterType.IsFile): string[] {
    const dirents = fs.readdirSync(path, { withFileTypes: true });
    const filterFunction: { [key in FilterType]: any } = {
        [FilterType.IsFile]: dirent => dirent.isFile(),
        [FilterType.IsDirectory]: dirent => dirent.isDirectory()
    }

    return dirents
        .filter(filterFunction[filterType])
        .map(dirent => dirent.name);
}

export function getFilenamesRecursively(path: string, filesArray: string[] = []): string[] {
    const files = getFilenames(path), folders = getFilenames(path, FilterType.IsDirectory);

    if (folders.length !== 0) {
        for (const folder of folders) {
            filesArray = getFilenamesRecursively(`${path}/${folder}`, filesArray);
        }
    }

    return filesArray.concat(files);
}

export function getFileSize(path: string): number {
    const stats = fs.statSync(path);
    const fileSizeInBytes = stats.size;

    // Convert the file size to megabytes (optional)
    return fileSizeInBytes / (1024 * 1024);
}

export function isPathExists(path: string): boolean {
    return fs.existsSync(path);
}

export function writeFile(filename: string, content: any): void {
    fs.writeFileSync(filename, content);
}

export function readFile(path: string): boolean | string | Buffer {
    return isPathExists(path) && fs.readFileSync(path);
}

export function getBase64DataFromFile(path: string): boolean | string {
    return readFile(path).toString('binary');
}

export function createFolder(path: string, recursive: boolean = false): boolean {
    return isPathExists(path) || fs.mkdirSync(path, { recursive });
}

export function renameFile(oldPath: string, newPath: string): void {
    fs.renameSync(oldPath, newPath);
}

export function scanPath(path: string): { files: string[] } {
    const absPath = `${env.rootFolder}/${path}`;

    logger.info({ message: `Scanning path '${absPath}'...`, label: 'scanPath' });
    const data = { files: getFilenamesRecursively(absPath) };
    logger.info({ message: 'Successfully scanned', label: 'scanPath' });

    cache(path, data, Arguments.CountFiles);

    return data;
}

export async function getPkgJsonDir(): Promise<string> {
    const { dirname } = require('path');
    const { constants, promises: { access } } = require('fs');

    for (let path of module.paths) {
        try {
            let prospectivePkgJsonDir = dirname(path);
            await access(path, constants.F_OK);
            return prospectivePkgJsonDir;
        } catch (e) { }
    }
}