import chalk from "chalk";
import fs from "fs-extra";
import path from "path";
import updateNotifier from "update-notifier";
import { fileURLToPath } from "url";

const doc = "https://developers.exlibrisgroup.com/cloudapps/docs/updating";
const repo = "https://github.com/ExLibrisGroup/cloudapp-sdk";

const message = `${chalk.bold("* A new version of the Ex Libris Cloud App SDK is available *")}\n\n`
    + chalk.dim("{currentVersion}")
    + chalk.reset(" → ")
    + chalk.green("{latestVersion}")
    + `\n\nRun ${chalk.cyan("{updateCommand}")} to update the CLI`
    + `\nThen run ${chalk.cyan("eca update")} to update your Cloud App`
    + `\n\n${chalk.dim(`For more information:\n${doc}\n${repo}`)}`;

export const notify = () => {    
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const packageJson = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../package.json")));
    updateNotifier({ pkg: packageJson }).notify({ isGlobal: true, message });
};
