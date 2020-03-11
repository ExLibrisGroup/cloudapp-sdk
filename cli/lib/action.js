const open = require("open");
const chalk = require("chalk");
const fs = require("fs-extra");
const os = require("os");
const { spawn } = require("child_process");
const sep = require("path").sep;

const { cwd, build, workNg } = require("./dirs");
const { getConfig } = require("./config/config");
const { updateIndexHtmlFile } = require("./files");
const { copyNg } = require("./work");

const startDev = (onStart, openBrowser) => {
    let started = false;
    const cmd = [ "start" ];
    const onDataOut = data => {
        const str = data.toString();
        if (!started && str.toString().indexOf("open your browser") > -1) {
            onStart();
            const {env, port} = getConfig();
            let url = getOpenUrl(env, port);
            console.log(`\r\nServer is listening on port ${port}.`);
            if (openBrowser) {
                console.log(`Opening browser on ${url}.\r\n`);
                open(url);
            }
            started = true;
        }
        if (str.indexOf("Compil") > -1) {
            console.log(str.trim());
        }
    };
    const onDataErr = data => {
        const str = data.toString();
        if (str.toLowerCase().startsWith("warn")) {
            console.warn(chalk.yellowBright(str.trim()));
        } else {
            console.error(chalk.redBright(str.trim()));
        }
    };
    const onExit = () => process.exit();
    runNpmCmd(cmd, onDataOut, onDataErr, onExit);
}

function getOpenUrl(env, port) {
    const envUrl = new URL(env);
    const origin = `http://localhost:${port}`;
    if (!envUrl.pathname.startsWith("/institution") && envUrl.search.indexOf("institute=") === -1) {
        return `${origin}/mng/login`;
    }
    return `${origin}${envUrl.pathname}${envUrl.search}`;
}

const buildProd = (args, onDone) => {
    const start = Date.now();
    fs.removeSync(`${cwd}${sep}build`);
    const cmd = [ "build", "--" ].concat(args);
    const onDataOut = () => {}
    const onDataErr = data => console.error(chalk.redBright(data.toString()));
    const onExit = error => {
        onDone();
        if (!error) {
            afterBuildProd();
            const files = fs.readdirSync(`${cwd}${sep}build`);
            console.log(`\r\nGenerated ${files.length} files in ${Date.now() - start}ms\r\n`)
            console.log(chalk.green("./build/" + files.join("\r\n./build/")));
        }
    }
    runNpmCmd(cmd, onDataOut, onDataErr, onExit);
}

const generate = args => {
    const files = [];
    const cmd = [ "generate", "--" ].concat(args).concat(["--defaults", "--skip-tests", "--interactive=false"]);
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
    runNpmCmd(cmd, onDataOut, onDataErr, onExit);
}

const extractLabels = args => {
    const cmd = [ "extract-i18n", "--" ].concat(args);
    const onDataOut = data => {
        const str = data.toString();
        if (str.indexOf('donat') === -1) {
            console.log(str.trim());
        }
    }
    const onDataErr = data => console.error(chalk.redBright(data.toString()));
    const onExit = () => {};
    runNpmCmd(cmd, onDataOut, onDataErr, onExit);
}

const runNpmCmd = (cmd, onDataOut, onDataErr, onExit) => {
    const p = spawn(getNpmCmd(), [ "run", "--silent" ].concat(cmd), {cwd: workNg, shell: true});
    if (p.error) {
        console.trace(error);
        process.exit(1);
    }
    let error = false;
    p.stdout.on("data", onDataOut);
    p.stderr.on("data", data => {
        error = true;
        onDataErr(data);
    });
    p.on("exit", () => onExit(error));
    process.on("exit", () => p.exit && p.exit());
}

const afterBuildProd = () => {
    fs.removeSync(`${build}${sep}3rdpartylicenses.txt`);
}

const getNpmCmd = () => getCmd("npm")

const getCmd = cmd => `${cmd}${os.platform() === "win32" ? ".cmd" : ""}`;

module.exports = { startDev, buildProd, generate, extractLabels }

