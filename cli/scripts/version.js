import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log(`v${JSON.parse(fs.readFileSync(path.resolve(__dirname, "../package.json"))).version}`);
