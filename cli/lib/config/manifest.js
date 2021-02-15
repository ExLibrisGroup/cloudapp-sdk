const { pick, pickBy, omit }  = require("lodash");

const fs = require("fs-extra");

const { cwd, work, workNg } = require("../dirs");
const { getConfig } = require("./config");

const copyManifest = () => {
    for (const dir of [work, workNg]) {
        fs.copySync(`${cwd}/manifest.json`, `${dir}/src/assets/manifest.json`);
    }
}

const updateManifest = () => {
    const manifest = omit(require(`${cwd}/manifest.json`), ["$schema"]);
    const config = pickBy(pick(getConfig(), ["name", "title", "subtitle", "author"]),
        x => typeof x !== 'undefined' && `${x}`.trim().length > 0);
    const obj = Object.assign({ id: config.name }, omit(config, ["name"]), manifest);
    const updated = JSON.stringify(obj, null, 3);
    fs.writeFileSync(`${cwd}/manifest.json`, updated);
    copyManifest();
    return updated;
}

module.exports = { updateManifest, copyManifest }
