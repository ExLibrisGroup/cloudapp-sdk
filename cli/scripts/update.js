const path = require("path");
const chalk = require("chalk");
const fs = require("fs-extra");
const prompts = require("prompts");
const compareVersions = require('compare-versions');
const baseName = '@exlibris/exl-cloudapp-base';
const { syncNgDir } = require("../lib/work");
const { install } = require("../lib/install");
const { globalBaseDir, cwd, work } = require("../lib/dirs");

const { dependencies, devDependencies } = require(`${globalBaseDir}/package.json`)
const cleanVer = ver => ver.replace(/^[\^~]+/g, '');

const scripts = {
  "1.2": () => {
    const file = `${work}/src/app/app.module.ts`;
    let module = fs.readFileSync(file, "utf8");
    module = module.replace(/getTranslateModule\(\)/g, 'CloudAppTranslateModule.forRoot()');
    module = module.replace(/getTranslateModule/g, 'CloudAppTranslateModule');
    fs.writeFileSync(file, module);
  }
}

syncNgDir()
  .then(async () => {
    const package = require(`${cwd}${path.sep}package.json`);
    const oldver = cleanVer(require(`${cwd}${path.sep}package-lock.json`).dependencies[baseName].version);
    const newver = cleanVer(dependencies[baseName]);
    if (compareVersions.compare(oldver, newver, '>=')) {
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
    Object.entries(scripts).forEach(([ ver, func ]) => {
      const scriptver = cleanVer(ver);
      if (compareVersions.compare(oldver, scriptver, '<=') && compareVersions.compare(newver, scriptver, '>=')) {
        func();
      }
    })
  })
  .catch(error => {
    console.trace(chalk.redBright(error.toString()));
    process.exit(1);
  });