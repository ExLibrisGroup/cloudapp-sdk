import crypto from 'node:crypto';
import fsp from 'node:fs/promises';
import path from 'node:path';

interface NodeError extends Error {
  code?: string;
}

export function isNodeError(error: unknown): error is NodeError {
  return error instanceof Error;
}

export function sha256(content: string | NodeJS.ArrayBufferView): string {
  return crypto.createHash('sha256').update(content).digest('hex');
}

export function toPosix(relativePath: string): string {
  return relativePath.split(path.sep).join('/');
}

export function resolveWithin(root: string, relativePath: string, label: string): string {
  if (path.isAbsolute(relativePath)) {
    throw new Error(`Invalid ${label} path in installer metadata: ${relativePath}`);
  }
  const resolvedRoot = path.resolve(root);
  const resolved = path.resolve(resolvedRoot, relativePath);
  if (resolved !== resolvedRoot && !resolved.startsWith(`${resolvedRoot}${path.sep}`)) {
    throw new Error(`Invalid ${label} path in installer metadata: ${relativePath}`);
  }
  return resolved;
}

// Resolving the selected root once makes later containment and symlink checks
// apply to the real directory tree instead of a symlinked alias.
export async function resolveTargetRoot(target: string): Promise<string> {
  const resolved = path.resolve(target);
  try {
    return await fsp.realpath(resolved);
  } catch (error: unknown) {
    if (isNodeError(error) && error.code === 'ENOENT') {
      throw new Error(`Not an Alma Cloud App project: ${resolved}`);
    }
    throw error;
  }
}

async function assertNoSymlinkedParent(targetRoot: string, targetPath: string): Promise<void> {
  const relative = path.relative(targetRoot, path.dirname(targetPath));
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`Refusing to write outside the Cloud App: ${targetPath}`);
  }

  // Lexical path checks do not catch symlinked parent directories.
  let current = targetRoot;
  for (const part of relative.split(path.sep).filter(Boolean)) {
    current = path.join(current, part);
    try {
      const entry = await fsp.lstat(current);
      if (entry.isSymbolicLink()) {
        throw new Error(`Refusing to write through symlinked directory: ${current}`);
      }
    } catch (error: unknown) {
      if (!isNodeError(error) || error.code !== 'ENOENT') throw error;
      break;
    }
  }
}

export async function readJson(filePath: string, optional = false): Promise<unknown> {
  try {
    const parsed: unknown = JSON.parse(await fsp.readFile(filePath, 'utf8'));
    return parsed;
  } catch (error: unknown) {
    if (optional && isNodeError(error) && error.code === 'ENOENT') return undefined;
    if (error instanceof SyntaxError) {
      throw new Error(`Invalid JSON: ${filePath}`);
    }
    throw error;
  }
}

export async function listFiles(directory: string): Promise<string[]> {
  const files: string[] = [];
  const entries = await fsp.readdir(directory, { withFileTypes: true });
  for (const entry of entries.sort((left, right) => left.name.localeCompare(right.name))) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...await listFiles(fullPath));
    } else if (entry.isFile()) {
      files.push(fullPath);
    }
  }
  return files;
}

export async function readChecksum(filePath: string): Promise<string | undefined> {
  try {
    return sha256(await fsp.readFile(filePath));
  } catch (error: unknown) {
    if (isNodeError(error) && error.code === 'ENOENT') return undefined;
    throw error;
  }
}

export async function writeAtomic(
  filePath: string,
  content: string | NodeJS.ArrayBufferView,
  targetRoot: string,
): Promise<void> {
  await assertNoSymlinkedParent(targetRoot, filePath);
  await fsp.mkdir(path.dirname(filePath), { recursive: true });
  const temporaryPath = `${filePath}.tmp-${process.pid}-${crypto.randomBytes(6).toString('hex')}`;
  try {
    await fsp.writeFile(temporaryPath, content);
    await fsp.rename(temporaryPath, filePath);
  } finally {
    await fsp.rm(temporaryPath, { force: true });
  }
}
