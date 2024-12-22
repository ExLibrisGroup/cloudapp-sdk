import chokidar from "chokidar";
import path from "path";

import { cwd, work } from "./dirs.js";
import { copyWorkDir, copyWorkFile, deleteWorkDir, deleteWorkFile } from "./work.js";

const ignored = [
    /(^|[\/\\])\..+/,
    "**/node_modules",
    "package-lock.json",
    "package.json",
    "scripts/**"
];

export const startWatcher = () => {
    const watcher = chokidar.watch("file, dir, glob, or array", { ignored, persistent: true, cwd, ignoreInitial: true });
    watcher.on("add", copyWorkFile).on("change", copyWorkFile).on("unlink", deleteWorkFile);
    watcher.on("addDir", copyWorkDir).on("unlinkDir", deleteWorkDir);
    watcher.add(path.basename(work));
}
