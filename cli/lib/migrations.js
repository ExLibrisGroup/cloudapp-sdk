
import chalk from "chalk";
import { spawn } from "child_process";
import fs from "fs-extra";
import { glob } from "glob";
import _ncp from "ncp";
import ora from "ora";
import path from "path";
import prettyHrtime from "pretty-hrtime";
import prompts from "prompts";
import { replaceInFileSync } from "replace-in-file";
import util from "util";

import { cwd, globalBaseDir, work, workNg } from "../lib/dirs.js";
import { syncNgDir } from "../lib/work.js";
import { tsconfigOverride } from "./config/config.js";

const ncp = util.promisify(_ncp);

const migrateV1_2 = async () => {
    const file = `${work}/src/app/app.module.ts`;
    let module = fs.readFileSync(file, "utf8");
    module = module.replace(/getTranslateModule\(\)/g, 'CloudAppTranslateModule.forRoot()');
    module = module.replace(/getTranslateModule/g, 'CloudAppTranslateModule');
    fs.writeFileSync(file, module);
}

const migrateV2_0 = async () => {

    const handleRejection = reason => {
        console.error(chalk.redBright("Unhandled rejection: "), reason.stack);
        process.exit();
    }

    const cleanUpError = () => {
        if (fs.existsSync(".node_modules")) {
            fs.renameSync(".node_modules", "node_modules");
        }
    }

    const cleanUpErrorExit = () => {
        cleanUpError();
        if (process.exitCode === undefined) {
            process.exit(-1);
        }
    }

    const cleanUp = () => {
        cleanUpError();
        fs.removeSync(`${tmpDir}`);
    }

    process.on("SIGINT", cleanUpErrorExit);
    process.on("SIGQUIT", cleanUpErrorExit);
    process.on("SIGTERM", cleanUpErrorExit);
    process.on("beforeExit", cleanUpError);
    process.on("uncaughtException", cleanUpError);
    process.on("unhandledRejection", handleRejection);

    const tmpDir = path.resolve(cwd, ".tmp-update-2.0");

    fs.ensureDir(tmpDir);

    await syncNgDir();

    await ncp(workNg, tmpDir);

    fs.writeFileSync(path.resolve(tmpDir, ".npmrc"), "legacy-peer-deps = true");
    if (fs.existsSync("node_modules")) {
        // node_modules might still be locked after install, so wait a bit
        await new Promise(resolve => setTimeout(resolve, 5000));
        fs.renameSync("node_modules", ".node_modules");
    }
    const runCmd = async (command, args) => {
        return new Promise((resolve, reject) => {
            const log = fs.createWriteStream(path.resolve(tmpDir, ".log"), { flags: 'a' });
            log.write(`\r\n>> Running ${[command, ...args].join(" ")}\r\n`);
            const cmd = spawn(command, args, { cwd: tmpDir, shell: true });
            cmd.stdout.pipe(log);
            cmd.stderr.pipe(log);
            cmd.on("exit", code => {
                if (code !== 0) {
                    cleanUpError();
                    reject(new Error("Command returned a non zero exit code. Check the log for more information."));
                } else {
                    resolve();
                }
            });
        });
    }

    const runMaterialLegacyReplacements = () => {
        const log = fs.createWriteStream(path.resolve(tmpDir, ".log"), { flags: 'a' });
        try {
            log.write("\r\nReplacing legacy Angular Material...\r\n");
            const results = replaceInFileSync({
                files: `${tmpDir}/**/*.ts`,
                from: [
                    /(import .+ from ["']@angular\/material\/)legacy-(.*["'])/g,
                    /MatLegacy\w+ as ([^,])/g,
                    /MAT_LEGACY_.+ as (\w+)/g,
                    /MAT_LEGACY_/g
                ],
                to: [
                    "$1$2",
                    "$1",
                    "$1",
                    ""
                ],
                ignore: [
                    `**/node_modules/**/*`,
                    `**/.vscode/**/*`
                ],
                countMatches: true,
            });
            log.write(JSON.stringify(results.filter(r => r.hasChanged), null, 2) + "\r\n");
        } finally {
            log.close();
        }
    }

    const runAdditionalReplacements = () => {
        const log = fs.createWriteStream(path.resolve(tmpDir, ".log"), { flags: 'a' });
        try {
            log.write("\r\nRunning additional replacements...\r\n");
            const results = [{
                files: `${tmpDir}/**/*.ts`,
                from: [
                    /(["'])(eca-components["'])/g,
                    /LazyTranslateLoader/g
                ],
                to: [
                    "$1@exlibris/$2",
                    "HttpTranslateLoader"
                ],
                ignore: [
                    `**/node_modules/**/*`,
                    `**/.vscode/**/*`
                ],
                countMatches: true,
            },
            {
                files: `${tmpDir}/**/*.scss`,
                from: [
                    /mat.m2-get-color-from-palette\(map-get(\(\$theme,\s*[\w-]+\))\)/g,
                    /mat.m2-get-color-from-palette\(map-get\((\$theme,\s*\w+)\s*\)\s*,\s*([\w-]+)\)/g
                ],
                to: [
                    "mat.get-theme-color$1",
                    (...match) => {
                        const hues = {
                            lighter: 70,
                            darker: 30
                        };
                        const hue = hues[match[2]] || match[2];
                        if (hue === "default-contrast") {
                            return "mat.get-theme-color($theme, on-primary)";
                        }
                        return `mat.get-theme-color(${match[1]}, ${hue})`;
                    }
                ],
                ignore: [
                    `**/node_modules/**/*`,
                    `**/.vscode/**/*`
                ],
                countMatches: true,
            }].map(options => replaceInFileSync(options));
            log.write(JSON.stringify(results.map(r => r.filter(r => r.hasChanged)), null, 2) + "\r\n");
        } finally {
            log.close();
        }
    }

    fs.writeFileSync(`${tmpDir}/package.json`, JSON.stringify({
        "name": "my-exl-cloudapp",
        "version": "1.0.0",
        "private": true,
        "dependencies": {
            "@angular/core": "^11.2.14",
            "@angular/cdk": "^11.2.12",
            "@angular/compiler": "^11.2.14",
            "@angular/material": "^11.2.12"
        },
        "devDependencies": {
            "@angular/cli": "^11.2.13",
            "@angular/compiler-cli": "^11.2.14",
            "typescript": "^4.1.5"
        }
    }, null, 2));

    console.log("\r\nThis process will take a while, please be patient.\r\n")

    {
        const spinner = ora("Getting things ready...").start();
        await runCmd("npm", ["install"]);
        spinner.stop();
    }

    for (let ver = 12; ver <= 18; ver++) {
        const spinner = ora(`Upgrading to ${chalk.magentaBright(`Angular ${ver}`)}`).start();
        const start = process.hrtime();
        await runCmd("npx", `--no-install ng update @angular/core@${ver} @angular/cli@${ver} @angular/material@${ver} --force --allow-dirty`.split(' '));
        if (ver === 16) {
            await runCmd("npx", `--no-install ng generate @angular/material:mdc-migration`.split(' '));
            runMaterialLegacyReplacements();
        }
        spinner.stopAndPersist({ symbol: chalk.green("√"), text: chalk.gray.italic(`Angular ${ver} ... [${prettyHrtime(process.hrtime(start))}]`) });
    }

    const spinner = ora("Finishing up...").start();

    runAdditionalReplacements();

    {
        const log = fs.createWriteStream(path.resolve(tmpDir, ".log"), { flags: "a" });
        try {
            const files = glob.sync(`**/*`, { cwd: work, nodir: true, dot: true, ignore: ["src/assets/**", "src/i18n/**"] });
            for (const file of files) {
                const from = path.resolve(tmpDir, file);
                const to = path.resolve(work, file);
                log.write(`\r\n${from} => ${to}`);
                fs.copyFileSync(from, to);
            }
        } finally {
            log.on("close", cleanUp);
            log.end();
        }
    }

    {
        const packageJson = JSON.parse(fs.readFileSync(`${cwd}/package.json`));
        [
            "@biesbjerg/ngx-translate-extract",
            "@exlibris/exl-cloudapp-cli",
            "@types/jasminewd2",
            "eca-components",
            "jasmine-spec-reporter",
            "karma-coverage-istanbul-reporter"
        ].forEach(p => {
            delete packageJson.dependencies[p];
            delete packageJson.devDependencies[p];
        });
        fs.writeFileSync(`${cwd}/package.json`, JSON.stringify(packageJson, null, 2));
    }

    fs.copyFileSync(`${globalBaseDir}/cloudapp/jsconfig.json`, `${work}/jsconfig.json`)

    spinner.stop();

    console.log();
    console.log("Migrations completed")

    process.off("SIGINT", cleanUpErrorExit);
    process.off("SIGQUIT", cleanUpErrorExit);
    process.off("SIGTERM", cleanUpErrorExit);
    process.off("beforeExit", cleanUpError);
    process.off("uncaughtException", cleanUpError);
    process.off("unhandledRejection", handleRejection);

    console.log();
    console.log("Please note:")
    console.log("This update turns on the strictness compiler flags of both Angular templates and TypeScript.")
    console.log("While this is the recommended course of action, it is likely that this will produce many errors that will need to be fixed manually.")
    console.log("You may choose to skip this for now for an easier update, but it is recommended that you turn them on gradually and fix any errors you get.")
    console.log();

    const response = await prompts({
        type: "confirm",
        name: "value",
        message: "Apply the new strictness flags?",
        initial: false
    });
    if (!response.value) {
        fs.writeFileSync(tsconfigOverride, JSON.stringify({
            compilerOptions: {
                strict: false,
                noImplicitOverride: false,
                noPropertyAccessFromIndexSignature: false,
                noImplicitReturns: false,
                noFallthroughCasesInSwitch: false
            },
            angularCompilerOptions: {
                strictInjectionParameters: true,
                strictInputAccessModifiers: true,
                strictTemplates: false
            }
        }, null, 2));
    }

}

export const migrations = {
    "1.2": migrateV1_2,
    "2.0.0-rc.0": migrateV2_0
}