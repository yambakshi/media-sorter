const fs = require('fs');


export const getBase64DataFromFile = filename => readFile(filename).toString('binary');

export function getFilenames(folder) {
    const dirents = fs.readdirSync(folder, { withFileTypes: true });

    return dirents
        .filter(dirent => dirent.isFile())
        .map(dirent => dirent.name);
}

export function getFileSize(path) {
    const stats = fs.statSync(path);
    const fileSizeInBytes = stats.size;

    // Convert the file size to megabytes (optional)
    return fileSizeInBytes / (1024 * 1024);
}

export function isPathExists(path) {
    return fs.existsSync(path);
}

export function writeFile(filename, content) {
    fs.writeFileSync(filename, content);
}

export function readFile(path) {
    return isPathExists(path) && fs.readFileSync(path);
}

export function createFolder(path) {
    return isPathExists(path) || fs.mkdirSync(path);
}

export function renameFile(oldPath, newPath) {
    fs.renameSync(oldPath, newPath);
}

export async function getPkgJsonDir() {
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