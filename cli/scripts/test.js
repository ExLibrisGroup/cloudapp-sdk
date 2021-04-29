const chalk = require("chalk");
const { startWatcher } = require("../lib/watch");
const { test } = require("../lib/action");
const { syncNgDir } = require("../lib/work");

const args = process.argv.slice(3);

syncNgDir()
  .then(() => {
    startWatcher();
    test(args);
  })
  .catch(error => {
    console.trace(chalk.redBright(error));
    process.exit(1);
  });