import compareVersions from "compare-versions";
import fs from "fs-extra";
import path from "path";

import { cwd } from "../lib/dirs.js";

const baseName = '@exlibris/exl-cloudapp-base';

export const applyNodeOptions = () => {
    const packageLock = JSON.parse(fs.readFileSync(`${cwd}${path.sep}package-lock.json`));
    const version = (packageLock.dependencies ? packageLock.dependencies[baseName] : packageLock.packages[`node_modules/${baseName}`]).version;
    if (compareVersions.compare(version, "2.0", "<") && compareVersions.compare(process.version, "18", ">")
        && (process.env.NODE_OPTIONS || "").indexOf("--openssl-legacy-provider") === -1) {
        process.env.NODE_OPTIONS = `${process.env.NODE_OPTIONS || ""} --openssl-legacy-provider`.trim();
    }
}