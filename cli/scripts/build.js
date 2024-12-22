import chalk from "chalk";
import ora from "ora";

import { buildProd } from "../lib/action.js";
import { applyNodeOptions } from "../lib/fns.js";
import { syncNgDir } from "../lib/work.js";

process.env.NODE_ENV = "production";

const args = process.argv.slice(3);
let spinner;

applyNodeOptions();

syncNgDir()
  .then(() => {
    spinner = ora().start("Building...");
    buildProd(args, spinner);
  })
  .catch(error => {
    spinner && spinner.stop();
    console.trace(chalk.redBright(error));
    process.exit(1);
  });


