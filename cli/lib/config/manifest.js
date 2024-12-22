import fs from "fs-extra";
import _ from "lodash";

import { cwd, work, workNg } from "../dirs.js";
import { getConfig } from "./config.js";

const { omit, pick, pickBy } = _;

export const copyManifest = () => {
    for (const dir of [work, workNg]) {
        fs.copySync(`${cwd}/manifest.json`, `${dir}/src/assets/manifest.json`);
    }
}

export const updateManifest = () => {
    const manifest = omit(JSON.parse(fs.readFileSync(`${cwd}/manifest.json`)), ["$schema"]);
    const config = pickBy(pick(getConfig(), ["name", "title", "subtitle", "author"]),
        x => typeof x !== 'undefined' && `${x}`.trim().length > 0);
    const obj = Object.assign({ id: config.name }, omit(config, ["name"]), manifest);
    const updated = JSON.stringify(obj, null, 3);
    fs.writeFileSync(`${cwd}/manifest.json`, updated);
    copyManifest();
    return updated;
}
