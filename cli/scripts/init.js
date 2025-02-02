import chalk from "chalk";
import fs from "fs-extra";
import _ncp from "ncp";
import ora from "ora";
import prompts from "prompts";
import util from "util";

import { checkConfig } from "../lib/config/config.js";
import { updateManifest } from "../lib/config/manifest.js";
import { cwd, globalBaseDir, work, workNg } from "../lib/dirs.js";

const ncp = util.promisify(_ncp);

const copyBaseDir = () => {
    return ncp(globalBaseDir, cwd)
        .then(() => ncp(`${workNg}/src/app`, `${work}/src/app`))
        .then(() => ncp(`${workNg}/src/assets`, `${work}/src/assets`))
        .then(() => fs.copy(`${workNg}/src/main.scss`, `${work}/src/main.scss`))
}

const initNg = () => {
    return fs.ensureDir(workNg)
        .then(() => fs.copy(`${globalBaseDir}/.ng/angular.json`, `${workNg}/angular.json`))
}

const confirmEmptyDir = async () => {
    if ((fs.readdirSync(cwd) || []).length === 0) return Promise.resolve();
    console.log(`\r\nWorking directory is not empty. [${cwd}]`)
    const response = await prompts({
        type: "confirm",
        name: "value",
        message: "Are you sure you want delete everything in this directory?",
        initial: false
    });
    if (response.value) {
        const spinner = ora().start();
        return fs.emptyDir(cwd).then(() => spinner.stop());
    }
    return Promise.reject(new Error("Directory must be empty"));
}

const confirmExistingApp = async () => {
    console.log(`\r\nExisting app detected. [${cwd}]`)
    const response = await prompts({
        type: "confirm",
        name: "value",
        message: "Do you want to reconfigure this existing app?",
        initial: false
    });
    if (response.value) return Promise.resolve({ title: 'default', subtitle: 'default', author: 'default' });
    return Promise.reject(new Error("Existing app detected."));
}

const isExistingApp = fs.existsSync(`${cwd}/manifest.json`) && fs.existsSync(`${cwd}/cloudapp`);
if (isExistingApp) {
    initNg().then(confirmExistingApp).then(checkConfig).then(() => {
        console.log("\r\nConfiguration created for existing app.")
    }).catch(e => {
        console.error(chalk.redBright(`\r\n${e.message}`));
        process.exit(1);
    });
} else {
    confirmEmptyDir().then(copyBaseDir).then(async () => {
        await checkConfig();
        updateManifest();
        console.log("\r\nThe following files and folders were created:")
        console.log(chalk.green(fs.readdirSync(cwd).join("\r\n")), "\r\n");
        console.log("Done.\r\n")
    }).catch(e => {
        console.error(chalk.redBright(`\r\n${e.message}`));
        process.exit(1);
    });
}

