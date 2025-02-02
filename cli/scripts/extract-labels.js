
import chalk from "chalk";

import { extractLabels } from "../lib/action.js";
import { work } from "../lib/dirs.js";
import { syncNgDir } from "../lib/work.js";

syncNgDir()
  .then(() => extractLabels([
    `--input`, `${work}/src`,
    `--output`, `${work}/src/i18n/_.json`,
    `--clean`, `--sort`, `--format`, `namespaced-json`
  ]))
  .catch(error => {
    console.trace(chalk.redBright(error));
    process.exit(1);
  });
