import fsp from 'node:fs/promises';

import { isNodeError, readChecksum, resolveWithin, sha256 } from './filesystem';
import type {
  InstallerMetadata,
  StatusEntry,
  StatusResult,
  StatusState,
} from './types';

async function inspectStatusFile(
  targetRoot: string,
  packageRoot: string,
  targetRelative: string,
  sourceRelative: string,
  recordedChecksum: string,
): Promise<StatusEntry> {
  const targetPath = resolveWithin(targetRoot, targetRelative, 'target');
  const sourcePath = resolveWithin(packageRoot, sourceRelative, 'source');
  const currentChecksum = await readChecksum(targetPath);

  let bundledChecksum: string | undefined;
  try {
    bundledChecksum = sha256(await fsp.readFile(sourcePath));
  } catch (error: unknown) {
    if (!isNodeError(error) || error.code !== 'ENOENT') throw error;
  }

  let state: StatusState;
  if (!currentChecksum) {
    state = 'missing';
  } else if (bundledChecksum && currentChecksum === bundledChecksum) {
    state = 'current';
  } else if (currentChecksum === recordedChecksum) {
    state = bundledChecksum ? 'outdated' : 'source-unavailable';
  } else {
    state = 'modified';
  }
  return { targetRelative, state };
}

export async function readStatus(
  targetRoot: string,
  packageRoot: string,
  currentVersion: string,
  metadata?: InstallerMetadata,
): Promise<StatusResult> {
  if (!metadata) {
    return {
      command: 'status',
      targetRoot,
      distribution: { current: currentVersion },
      installed: false,
      skills: [],
      entries: [],
      driftCount: 0,
    };
  }

  const entries = await Promise.all(
    Object.entries(metadata.files)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([targetRelative, record]) =>
        inspectStatusFile(
          targetRoot,
          packageRoot,
          targetRelative,
          record.source,
          record.checksum,
        )),
  );
  return {
    command: 'status',
    targetRoot,
    distribution: {
      installed: metadata.distribution.version,
      current: currentVersion,
    },
    installed: true,
    skills: metadata.skills,
    entries,
    driftCount: entries.filter(entry => entry.state !== 'current').length,
  };
}
