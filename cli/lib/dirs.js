const path = require("path");

const cwd = process.cwd();
const appBaseDir = `${cwd}${path.sep}node_modules${path.sep}@exlibris${path.sep}exl-cloudapp-base${path.sep}base`;
const globalBaseDir = `${path.dirname(require.resolve("@exlibris/exl-cloudapp-base/package.json"))}/base`;

const work = `${cwd}${path.sep}cloudapp`;
const workNg = `${cwd}${path.sep}.ng`;
const baseNg = `${appBaseDir}${path.sep}.ng`;
const build = `${cwd}${path.sep}build`;

module.exports = { cwd, appBaseDir, globalBaseDir, work, build, workNg, baseNg }
