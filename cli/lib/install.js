import { execSync } from "child_process";

export const install = () => execSync("npm install --loglevel=error", { stdio: "inherit" });
export const installLPD = () => execSync("npm install --legacy-peer-deps --loglevel=error", { stdio: "inherit" });