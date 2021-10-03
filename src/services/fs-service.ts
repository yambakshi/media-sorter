const fs = require('fs');


export const getBase64DataFromFile = (filename: string) => readFile(filename).toString('binary');

export function getFilenames(path: string): string[] {
    const dirents = fs.readdirSync(path, { withFileTypes: true });

    return dirents
        .filter(dirent => dirent.isFile())
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

export function writeFile(filename: string, content): void {
    fs.writeFileSync(filename, content);
}

export function readFile(path: string) {
    return isPathExists(path) && fs.readFileSync(path);
}

export function createFolder(path: string, recursive: boolean = false) {
    return isPathExists(path) || fs.mkdirSync(path, { recursive });
}

export function renameFile(oldPath: string, newPath: string): void {
    fs.renameSync(oldPath, newPath);
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