import chalk from "chalk";
import { spawn } from "child_process";
import fs from "fs-extra";
import open from "open";
import os from "os";
import { sep } from "path";

import { getConfig } from "./config/config.js";
import { build, cwd, workNg } from "./dirs.js";
import { updateIndexHtmlFile } from "./files.js";
import { copyNg } from "./work.js";

/**
 * A (sisyphean) attempt to suppress information messages on stderr.
 * See https://github.com/angular/angular-cli/issues/17016
 * @param {string} err - The error message to compare
 */
const suppressErr = err => {
    return err.startsWith("Compil") ||
        ~err.indexOf("bundle");
}

const printError = data => {
    const str = data.toString().trim();
    if (suppressErr(str)) return;
    if (str.toLowerCase().startsWith("warn")) {
        console.warn(chalk.yellowBright(str));
    } else {
        console.error(chalk.redBright(str));
    }
}

export const startDev = (onStart, openBrowser, args = []) => {
    let started = false;
    const cmd = ["start", "--"].concat(args);
    const onDataOut = data => {
        const str = data.toString();
        if (!started && str.toString().indexOf("open your browser") > -1) {
            onStart();
            const { env, port } = getConfig();
            let url = getOpenUrl(env, port);
            console.log(`\r\nServer is listening on port ${port}.`);
            if (openBrowser) {
                console.log(`Opening browser on ${url}.\r\n`);
                const browserArg = process.argv.findIndex(a => a === '--browser');
                const app = browserArg > -1 ? process.argv[browserArg + 1] : process.env.ECA_BROWSER;
                const opts = app ? { app: app } : null;
                open(url, opts);
            }
            started = true;
        }
        if (str.indexOf("Compil") > -1) {
            console.log(str.trim());
        }
    };
    const onDataErr = data => printError(data);
    const onExit = code => process.exit(code);
    runNpmCmd(cmd, onDataOut, onDataErr, onExit, true);
}

function getOpenUrl(env, port) {
    const envUrl = new URL(env);
    const origin = `http://localhost:${port}`;
    if (!envUrl.pathname.startsWith("/institution") && envUrl.search.indexOf("institute=") === -1) {
        return `${origin}/mng/login`;
    }
    return `${origin}${envUrl.pathname}${envUrl.search}`;
}

export const buildProd = (args, spinner) => {
    const start = Date.now();
    const buildDir = `${cwd}${sep}build`;
    fs.removeSync(buildDir);
    const cmd = ["build", "--"].concat(args);
    const onDataOut = () => { }
    const onDataErr = data => {
        spinner.stop();
        printError(data);
        spinner.start();
    }
    const onExit = error => {
        spinner.stop();
        const files = fs.existsSync(buildDir) && fs.readdirSync(buildDir) || [];
        if (files.length > 0) {
            afterBuildProd();
            console.log(`\r\nGenerated ${files.length} files in ${Date.now() - start}ms\r\n`)
            console.log(chalk.green("./build/" + files.join("\r\n./build/")));
        }
    }
    runNpmCmd(cmd, onDataOut, onDataErr, onExit, true);
}

export const test = (args) => {
    const cmd = ["test", "--"].concat(args);
    const onDataOut = data => {
        console.log(data.toString())
    }
    const onDataErr = data => console.error(chalk.redBright(data.toString()));
    const onExit = (error, code) => {
        console.log(chalk.green('Done'));
        process.exit(code);
    }
    runNpmCmd(cmd, onDataOut, onDataErr, onExit);
}

export const generate = args => {
    const files = [];
    const cmd = ["generate", "--"].concat(args).concat(["--defaults", "--interactive=false"]);
    const onDataOut = data => {
        const str = data.toString();
        const matches = str.match(/^(?:CREATE|UPDATE)\s+.*$/gm);
        if (matches && matches.length > 0) {
            for (const match of matches) {
                files.push((match.split(" ")[1]).replace(/\//g, sep));
            }
        }
    };
    const onDataErr = data => console.error(chalk.redBright(data.toString()));
    const onExit = error => {
        if (!error && files.length > 0) {
            for (const file of files) copyNg([".ng", file].join(sep));
            console.log("\r\nFiles updated:")
            console.log(chalk.green(files.join("\r\n")));
            console.log();
        }
    }
    runNpmCmd(cmd, onDataOut, onDataErr, onExit, true);
}

export const extractLabels = args => {
    const cmd = ["extract-i18n", "--"].concat(args);
    const onDataOut = data => {
        const str = data.toString();
        if (str.indexOf('donat') === -1) {
            console.log(str.trim());
        }
    }
    const onDataErr = data => console.error(chalk.redBright(data.toString()));
    const onExit = () => { };
    runNpmCmd(cmd, onDataOut, onDataErr, onExit);
}

const runNpmCmd = (cmd, onDataOut, onDataErr, onExit, noColor) => {
    let opts = { cwd: workNg, shell: true };
    if (noColor) {
        opts.env = { ...process.env, FORCE_COLOR: 0, NO_COLOR: 1 };
    }
    const p = spawn(getNpmCmd(), ["run", "--silent"].concat(cmd), opts);
    if (p.error) {
        console.trace(error);
        process.exit(1);
    }
    let error = false;
    p.stdout.on("data", onDataOut);
    p.stderr.on("data", data => {
        if (!!data.toString().trim()) {
            error = true;
            onDataErr(data);
        }
    });
    p.on("exit", code => {
        onExit(error, code);
        if (code !== 0) {
            throw new Error("Process terminated with error");
        }
    });
    process.on("exit", () => p.exit && p.exit());
}

const afterBuildProd = () => {
    updateIndexHtmlFile(`${build}${sep}index.html`);
    fs.removeSync(`${build}${sep}3rdpartylicenses.txt`);
}

const getNpmCmd = () => getCmd("npm")

const getCmd = cmd => `${cmd}${os.platform() === "win32" ? ".cmd" : ""}`;

