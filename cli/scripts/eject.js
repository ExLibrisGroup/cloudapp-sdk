import chalk from "chalk";
import fs from "fs-extra";
import _ncp from "ncp";
import path from "path";
import util from "util";

import { work, workNg } from "../lib/dirs.js";
import { syncNgDir } from "../lib/work.js";

const ncp = util.promisify(_ncp);

const filePath = process.argv[3];

if (!filePath) {
    throw new Error("Path to file or folder to eject must be supplied as an argument.")
}

const source = path.resolve(workNg, filePath);

if (!fs.existsSync(source)) {
    throw new Error(`Specified path does not exist: ${source}`)
}

const destination = path.resolve(work, filePath);

syncNgDir()
    .then(() => ncp(source, destination))
    .then(() => {
        console.log(chalk.gray(`\r\nEjected to ${destination}\r\n`))
    })
    .catch(error => {
        console.trace(chalk.redBright(error));
        process.exit(1);
    });

