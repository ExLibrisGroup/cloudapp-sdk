import chalk from "chalk";
import _ from "lodash";
import ora from "ora";

import { startDev } from "../lib/action.js";
import { checkConfig } from "../lib/config/config.js";
import { updateManifest } from "../lib/config/manifest.js";
import { applyNodeOptions } from "../lib/fns.js";
import { install } from "../lib/install.js";
import { startWatcher } from "../lib/watch.js";
import { syncNgDir } from "../lib/work.js";

const { without } = _;

const doInstall = process.argv.indexOf('--no-install') === -1;
const openBrowser = process.argv.indexOf('--no-open-browser') === -1;
const args = without(process.argv.slice(3), '--no-install', '--no-open-browser');

doInstall && install();

applyNodeOptions();

let spinner;
syncNgDir()
  .then(async () => {
    await checkConfig();
    updateManifest();
    console.log();
    spinner = ora().start("Starting server...");
    startWatcher();
    startDev(() => spinner.stop(), openBrowser, args);
  })
  .catch(error => {
    spinner && spinner.stop();
    console.trace(chalk.redBright(error));
    process.exit(1);
  });

