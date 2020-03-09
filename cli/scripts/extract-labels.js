
const chalk = require("chalk");
const { syncNgDir } = require("../lib/work");
const { extractLabels } = require("../lib/action");
const {cwd, appBaseDir, workNg, work} = require("../lib/dirs");

syncNgDir()
  .then(() => extractLabels([
      `--input`, `${work}/src`, 
      `--output`, `${work}/src/i18n/*.json`,
      `--clean`,`--sort`, `--format`, `namespaced-json`
    ]))
    .catch(error => {
        console.trace(chalk.redBright(error));
        process.exit(1);
    });
