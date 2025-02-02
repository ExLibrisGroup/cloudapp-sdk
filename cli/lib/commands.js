export const commands = {
    build: "Build production-ready assets for app",
    init: "Initialize current directory",
    eject: "Eject a file or folder from the template scaffolding to the CloudApp working directory",
    "extract-labels": "Extract labels into json files for translation",
    generate: "Generate code in an initialized project",
    help: "Display this list of available commands",
    start: "Install dependencies, configure and start development server",
    test: "Build and start the test server",
    update: "Update to the latest SDK version and install updated packages",
    version: "Display the installed version of the CLI"
}

export const subcommands = {
    generate: {
        class: "Creates a new generic class definition",
        directive: "Creates a new generic directive definition",
        component: "Creates a new generic component definition",
        pipe: "Creates a new generic pipe definition",
        service: "Creates a new generic service definition"
    }
}

export const flags = {
    start: {
        "--no-install": "Do not install dependencies",
        "--no-open-browser": "Do not open browser after starting",
        "--browser <browser>": "Overwrite the default browser",
    }
}

export function getCommands() {
    return commands;
}

export function getSubCommands(command) {
    return subcommands[command] || {};
}

export function getFlags(command) {
    return flags[command] || {};
}
