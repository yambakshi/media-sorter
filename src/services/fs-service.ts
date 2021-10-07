import { env, logger } from "../../config";
import { Arguments } from "../enums";
import { cache } from "./cache-service";
import del from 'del';
import fs from 'fs';


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

export function getFilenamesRecursively(path: string, filesArray: string[] = [], showAbsPath: boolean = false): string[] {
    const files = getFilenames(path), folders = getFilenames(path, FilterType.IsDirectory);

    if (folders.length !== 0) {
        for (const folder of folders) {
            filesArray = getFilenamesRecursively(`${path}/${folder}`, filesArray, showAbsPath);
        }
    }

    return filesArray.concat(showAbsPath ? files.map(file => `${path}/${file}`) : files);
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

export function createFolder(path: string, recursive: boolean = false): boolean | void {
    return isPathExists(path) || fs.mkdirSync(path, { recursive });
}

export function renameFile(oldPath: string, newPath: string): void {
    fs.renameSync(oldPath, newPath);
}

export async function removeFolder(path: string): Promise<void> {
    try {
        await del(path, { force: true });
    } catch (error) {
        logger.error({ message: `Failed to delete folder '${path}'`, label: 'removeFolder' });
    }
}

export function scanFiles(path: string): { files: string[] } {
    const absPath = `${env.rootFolder}/${path}`;

    logger.info({ message: `Scanning path '${absPath}'...`, label: 'scanPath' });
    const data = { files: getFilenamesRecursively(absPath) };
    logger.info({ message: 'Successfully scanned', label: 'scanPath' });

    cache(path, Arguments.CountFiles, data);

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