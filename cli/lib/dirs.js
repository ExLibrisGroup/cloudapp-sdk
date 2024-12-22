import path from "path";

export const cwd = process.cwd();
export const appBaseDir = path.resolve(`${cwd}${path.sep}node_modules${path.sep}@exlibris${path.sep}exl-cloudapp-base${path.sep}base`);
export const globalBaseDir = path.resolve(`${path.dirname(import.meta.resolve("@exlibris/exl-cloudapp-base/package.json").replace("file:///", ""))}/base`);

export const work = `${cwd}${path.sep}cloudapp`;
export const workNg = `${cwd}${path.sep}.ng`;
export const baseNg = `${appBaseDir}${path.sep}.ng`;
export const build = `${cwd}${path.sep}build`;
