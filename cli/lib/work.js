import chalk from "chalk";
import fs from "fs-extra";
import _ncp from "ncp";
import { sep } from "path";
import util from "util";

import { angularJson, updateNgConfigPaths, updateTsConf } from "./config/config.js";
import { copyManifest } from "./config/manifest.js";
import { baseNg, work, workNg } from "./dirs.js";
import { indexHtml, updateIndexHtmlFile } from "./files.js";

const ncp = util.promisify(_ncp);

const log = msg => console.log(chalk.gray(`\r\n${msg}\r\n`));

const fileHandlers = {
    [[indexHtml]]: () => updateIndexHtmlFile(indexHtml),
    [[angularJson]]: () => updateNgConfigPaths()
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

export const copyNg = (path, isDirectory = false) => {
    const { src: dest, dest: src } = getWorkPaths(path);
    ensureSync(path, isDirectory);
    copyItem(src, dest, isDirectory);
}

const copyWork = (path, isDirectory = false) => {
    const { src, dest } = getWorkPaths(path);
    ensureSync(path, isDirectory);
    log(`Copying '${src}' -> '${dest}'`);
    copyItem(src, dest, isDirectory);
    (fileHandlers[dest] || (() => { }))();
}

const deleteWork = (path, isDirectory = false) => {
    const { dest, restore: src } = getWorkPaths(path);
    if (fs.pathExistsSync(src)) {
        log(`Restore original: Copy '${src}' -> '${dest}'`);
        copyItem(src, dest, isDirectory);
        (fileHandlers[dest] || (() => { }))();
    } else if (fs.pathExists(dest)) {
        log(`Removing '${dest}'`);
        fs.removeSync(dest);
    }
}

export const syncNgDir = () => {
    fs.emptyDirSync(workNg);
    fs.ensureDirSync(workNg);
    const updateAfterSync = function () {
        return new Promise(resolve => {
            setTimeout(() => {
                copyManifest();
                updateTsConf();
                updateNgConfigPaths();
                updateIndexHtmlFile(indexHtml);
                resolve();
            }, 2000);
        });
    }
    return ncp(baseNg, workNg).then(() => ncp(work, workNg)).then(() => updateAfterSync());
}

export const copyWorkFile = path => copyWork(path);
export const copyWorkDir = path => copyWork(path, true);
export const deleteWorkFile = path => deleteWork(path);
export const deleteWorkDir = path => deleteWork(path, true);
