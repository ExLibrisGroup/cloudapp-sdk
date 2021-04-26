const commands = {
    init: "Initialize current directory",
    start: "Install dependencies, configure and start development server",
    generate: "Generate code in an initialized project",
    "extract-labels": "Extract labels into json files for translation",
    build: "Build production-ready assets for app",
    help: "Display this list of available commands",
    version: "Display the installed version of the CLI",
    test: "Build and start the test server",
}

const subcommands = {
    generate: {
        class: "Creates a new generic class definition",
        directive: "Creates a new generic directive definition",
        component: "Creates a new generic component definition",
        pipe: "Creates a new generic pipe definition",
        service: "Creates a new generic service definition"
    }
}

const flags = {
    start: {
        "--no-install": "Do not install dependencies",
        "--no-open-browser": "Do not open browser after starting",
        "--browser <browser>": "Overwrite the default browser",
    }
}

function getCommands() {
    return commands;
}

function getSubCommands(command) {
    return subcommands[command] || {};
}

function getFlags(command) {
    return flags[command] || {};
}

module.exports = { getCommands, getSubCommands, getFlags };
