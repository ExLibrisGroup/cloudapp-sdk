const path = require("path");
const sep = path.sep;
const chalk = require("chalk");

const util = require("util");
const fs = require("fs-extra");
const ncp = util.promisify(require("ncp").ncp);

const { work, workNg, baseNg } = require("./dirs");
const { indexHtml, updateIndexHtmlFile } = require("./files");
const { copyManifest } = require("./config/manifest.js");

const log = msg => console.log(chalk.gray(`\r\n${msg}\r\n`));

const fileHandlers = {
    [[indexHtml]]: () => updateIndexHtmlFile(indexHtml)
}

const getWorkPaths = path => {
    const p = path.split(sep).splice(1).join(sep);
    const src = [work, p].join(sep);
    const dest = [workNg, p].join(sep);
    const restore = [baseNg, p].join(sep);
    return { src, dest, restore }
}

const ensureSync = (path, isDirectory = false) => {
    return isDirectory ? fs.ensureDirSync(path) : fs.ensureFileSync(path);
}

const copyItem = (src, dest, isDirectory = false) => {
    return isDirectory ? ncp(src, dest) : fs.copySync(src, dest);
}

const copyNg = (path, isDirectory = false) => {
    const {src: dest, dest: src} = getWorkPaths(path);
    ensureSync(path, isDirectory);
    copyItem(src, dest, isDirectory);
}

const copyWork = (path, isDirectory = false) => {
    const {src, dest} = getWorkPaths(path);
    ensureSync(path, isDirectory);
    log(`Copying '${src}' -> '${dest}'`);
    copyItem(src, dest, isDirectory);
    (fileHandlers[dest] || (() => {}))();
}

const deleteWork = (path, isDirectory = false) => {
    const {dest, restore: src} = getWorkPaths(path);
    if (fs.pathExistsSync(src)) {
        log(`Restore original: Copy '${src}' -> '${dest}'`);
        copyItem(src, dest, isDirectory);
        (fileHandlers[dest] || (() => {}))();
    } else if (fs.pathExists(dest)) {
        log(`Removing '${dest}'`);
        fs.removeSync(dest);
    }
}

const syncNgDir = () => {
    fs.emptyDirSync(workNg);
    fs.ensureDirSync(workNg);
    const updateAfterSync = function() {
        return new Promise(resolve => {
            setTimeout(() => {
                copyManifest();
                resolve();
            }, 2000);
        });
    }
    return ncp(baseNg, workNg).then(() => ncp(work, workNg)).then(() => updateAfterSync());
}

const copyWorkFile = path => copyWork(path);
const copyWorkDir = path => copyWork(path, true);
const deleteWorkFile = path => deleteWork(path);
const deleteWorkDir = path => deleteWork(path, true);

module.exports = { copyWorkFile, copyWorkDir, deleteWorkFile, deleteWorkDir, syncNgDir, copyNg }
