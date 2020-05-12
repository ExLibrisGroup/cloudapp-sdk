const ora = require("ora");
const chalk = require("chalk");
const util = require("util");
const ncp = util.promisify(require("ncp").ncp);

const { startWatcher } = require("../lib/watch");
const { checkConfig } = require("../lib/config/config");
const { updateManifest } = require("../lib/config/manifest");
const { startDev } = require("../lib/action");
const { syncNgDir } = require("../lib/work");
const { install } = require("../lib/install");
const { appBaseDir, cwd } = require("../lib/dirs");

const doInstall = process.argv.indexOf('--no-install') === -1;
const openBrowser = process.argv.indexOf('--no-open-browser') === -1;

const copyVsDir = () => ncp(`${appBaseDir}/.vscode`, `${cwd}/.vscode`);

doInstall && install();

let spinner;
syncNgDir()
  .then(copyVsDir)
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

