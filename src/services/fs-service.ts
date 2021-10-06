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

export function countFilesRecursively(path: string, counter: number = 0): number {
    const files = getFilenames(path), folders = getFilenames(path, FilterType.IsDirectory);

    if (folders.length !== 0) {
        counter += files.length;
        for (let i = 0, length = folders.length; i < length; i++) {
            counter = countFilesRecursively(`${path}/${folders[i]}`, counter);
        }

        return counter;
    }

    return counter + files.length;
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