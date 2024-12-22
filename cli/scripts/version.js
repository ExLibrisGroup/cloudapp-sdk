import fs from "fs-extra";
import path from "path";

const __filename = import.meta.url;
const __dirname = path.dirname(__filename).replace("file:///", "");

console.log(`v${JSON.parse(fs.readFileSync(path.resolve(__dirname, "../package.json"))).version}`);
