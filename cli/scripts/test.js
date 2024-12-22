import chalk from "chalk";

import { test } from "../lib/action.js";
import { applyNodeOptions } from "../lib/fns.js";
import { startWatcher } from "../lib/watch.js";
import { syncNgDir } from "../lib/work.js";

const args = process.argv.slice(3);

applyNodeOptions();

syncNgDir()
  .then(() => {
    startWatcher();
    test(args);
  })
  .catch(error => {
    console.trace(chalk.redBright(error));
    process.exit(1);
  });