import chalk from "chalk";
import { spawnSync } from "child_process";
import compareVersions from "compare-versions";
import fs from "fs-extra";
import _ from "lodash";
import ora from "ora";
import path from "path";
import prompts from "prompts";

import { cwd, globalBaseDir } from "../lib/dirs.js";
import { install, installLPD } from "../lib/install.js";
import { migrations } from "../lib/migrations.js";
import { syncNgDir } from "../lib/work.js";

const baseName = '@exlibris/exl-cloudapp-base';

const { dependencies, devDependencies } = JSON.parse(fs.readFileSync(`${globalBaseDir}/package.json`));
const cleanVer = ver => ver.replace(/^[\^~]+/g, '');

const packageLock = JSON.parse(fs.readFileSync(`${cwd}${path.sep}package-lock.json`));

const oldver = cleanVer((packageLock.dependencies ? packageLock.dependencies[baseName] : packageLock.packages[`node_modules/${baseName}`]).version);
const newver = cleanVer(dependencies[baseName]);
if (compareVersions.compare(oldver, newver, '>=')) {
  console.log(chalk.redBright('Nothing to update'));
  process.exit();
}

const message = `Do you want to update the Cloud App framework from ${oldver} to ${newver}?`
const response = await prompts({
  type: "confirm",
  name: "value",
  message,
  initial: false
});
if (!response.value) {
  process.exit();
}

install();

const clearDeps = (deps1, deps2) => {
  for (const dep in deps1) {
    if (dep in deps2) {
      delete deps1[dep];
    }
  }
}

syncNgDir()
  .then(async () => {
    for (const [ver, func] of Object.entries(migrations)) {
      const scriptver = cleanVer(ver);
      if (compareVersions.compare(oldver, scriptver, '<') && compareVersions.compare(newver, scriptver, '>=')) {
        await func();
      }
    }

    const packageJson = JSON.parse(fs.readFileSync(`${cwd}${path.sep}package.json`));
    clearDeps(packageJson.dependencies || {}, devDependencies);
    clearDeps(packageJson.devDependencies || {}, dependencies);
    packageJson.devDependencies = Object.fromEntries(Object.entries(Object.assign({}, packageJson.devDependencies || {}, devDependencies)).sort());
    packageJson.dependencies = Object.fromEntries(Object.entries(Object.assign({}, packageJson.dependencies || {}, dependencies)).sort());
    const updated = JSON.stringify(packageJson, null, 2);

    console.log();

    const spinner = ora("Please wait...").start();

    await fs.writeFile(`${cwd}/package.json`, updated);
    await fs.remove(`${cwd}/node_modules`);
    await fs.remove(`${cwd}/package-lock.json`);

    spinner.stop();

    console.log();

    const filterPackages = _.difference([...Object.keys(packageJson.dependencies), ...Object.keys(packageJson.devDependencies)],
      [...Object.keys(dependencies), ...Object.keys(devDependencies)]);
    if (filterPackages.length > 0 && (await prompts({
      type: "confirm",
      name: "value",
      message: "Allow this process to attempt to update any remaining custom dependencies?",
      initial: true
    })).value) {
      console.log();
      spinner.start();
      installLPD();
      console.log();
      spawnSync("npx", `npm-check-updates --peer -m --removeRange --jsonUpgraded --enginesNode -f  "${filterPackages.join(",")}" -u`.split(" "), { cwd, shell: true, stdio: "inherit" });
      install();
      spinner.stop();
    } else {
      install();
    }

  })
  .catch(error => {
    console.trace(chalk.redBright(error.toString()));
    process.exit(1);
  });