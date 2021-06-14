const path = require("path");
const chalk = require("chalk");
const fs = require("fs-extra");
const prompts = require("prompts");
const compareVersions = require('compare-versions');
const baseName = '@exlibris/exl-cloudapp-base';
const { syncNgDir } = require("../lib/work");
const { install } = require("../lib/install");
const { appBaseDir, cwd } = require("../lib/dirs");

const { dependencies, devDependencies } = require(`${appBaseDir}/package.json`)
const cleanVer = ver => ver.replace(/^[\^~]+/g, '');

syncNgDir()
  .then(async () => {
    const package = require(`${cwd}${path.sep}package.json`);
    const oldver = require(`${cwd}${path.sep}package-lock.json`).dependencies[baseName].version;
    const newver = dependencies[baseName];
    if (compareVersions.compare(cleanVer(oldver), cleanVer(newver), '>=')) {
      console.log(chalk.redBright('Nothing to update'));
      return;
    } 
    const message = `Do you want to update the Cloud App framework from ${oldver} to ${newver}?`
    const response = await prompts({
      type: "confirm",
      name: "value",
      message,
      initial: false
    });
    if (!response.value) return;
    package.devDependencies = Object.assign({}, package.devDependencies, devDependencies);
    package.dependencies = Object.assign({}, package.dependencies, dependencies);
    const updated = JSON.stringify(package, null, 2);
    fs.writeFileSync(`${cwd}/package.json`, updated);
    install();
  })
  .catch(error => {
    console.trace(chalk.redBright(error.toString()));
    process.exit(1);
  });