import chalk from "chalk";

import { getFlags } from "../lib/commands.js";

export function printHelp(commands) {
    console.log(`\r\n${chalk.underline("Available Commands")}\r\n`);
    let length = 0;
    Object.keys(commands).forEach(cmd => length = Math.max(length, cmd.length));
    for (let command in commands) {
        const spaces = Array((length + 5) - command.length).fill(" ").join("");
        console.log(" ", chalk.bold(command), spaces, commands[command]);
        const flags = getFlags(command);
        for (let flag in flags) {
            console.log(Array(length + 8).fill(" ").join(""), "  ", flag, ":", flags[flag]);
        }
    }
    console.log();
}
