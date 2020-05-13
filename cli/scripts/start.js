const ora = require("ora");
const chalk = require("chalk");

const { startWatcher } = require("../lib/watch");
const { checkConfig } = require("../lib/config/config");
const { updateManifest } = require("../lib/config/manifest");
const { startDev } = require("../lib/action");
const { syncNgDir } = require("../lib/work");
const { install } = require("../lib/install");

const doInstall = process.argv.indexOf('--no-install') === -1;
const openBrowser = process.argv.indexOf('--no-open-browser') === -1;

doInstall && install();

let spinner;
syncNgDir()
  .then(async () => {
    await checkConfig();
    updateManifest();
    console.log();
    spinner = ora().start("Starting server...");
    startWatcher();
    startDev(() => spinner.stop(), openBrowser);
  })
  .catch(error => {
    spinner && spinner.stop();
    console.trace(chalk.redBright(error));
    process.exit(1);
  });

