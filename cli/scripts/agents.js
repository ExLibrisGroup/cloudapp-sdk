import chalk from "chalk";
import { spawnSync } from "child_process";
import { createRequire } from "module";
import path from "path";

const require = createRequire(import.meta.url);
const packageJsonPath = require.resolve("@exlibris/exl-cloudapp-agent/package.json");
const { bin } = require(packageJsonPath);
const agentCli = path.join(path.dirname(packageJsonPath), bin["exl-cloudapp-agent"]);

// The agent CLI owns argument parsing and defaults the target to the current directory.
const result = spawnSync(process.execPath, [agentCli, ...process.argv.slice(3)], { stdio: "inherit" });
if (result.error) {
    console.error(chalk.redBright(result.error.message));
    process.exit(1);
}
process.exit(result.status ?? 1);
