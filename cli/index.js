#! /usr/bin/env node

import chalk from "chalk";

import { getCommands, getSubCommands } from "./lib/commands.js";
import { notify } from "./lib/notifier.js";
import { printHelp } from "./scripts/help.js";

try {
    notify();
} catch { };

const [command, subcommand] = process.argv.slice(2);

const commands = getCommands();
const subcommands = getSubCommands(command);

const checkSubcommand = () => {
    if (Object.keys(subcommands).length > 0 && (!subcommand || !subcommands[subcommand])) {
        if (!subcommand) {
            console.error(`\r\n${chalk.redBright(`Missing subcommand`)}`);
        } else if (!subcommands[subcommand]) {
            console.error(`\r\n${chalk.redBright(`Unknown subcommand: ${subcommand}`)}`);
        }
        printHelp(subcommands);
        process.exit(1);
    }
}

if (command && command !== "help") {
    if (commands[command]) {
        checkSubcommand();
        import(`./scripts/${process.argv[2]}.js`);
    } else if (command.length > 0) {
        console.error(`\r\n${chalk.redBright(`Unknown command: ${command}`)}`);
    }
} else {
    printHelp(commands);
}

