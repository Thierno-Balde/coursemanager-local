import fs from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';
import { getPaths } from './storage.js';

type CopyResult = {
  id: string;
  destAbsolute: string;
  destRelative: string;
  originalName: string;
  ext: string;
};

async function ensureResourcesDir(): Promise<string> {
  const { resourcesDir } = getPaths();
  await fs.mkdir(resourcesDir, { recursive: true });
  return resourcesDir;
}

export async function copyResourceFile(sourcePath: string): Promise<CopyResult> {
  const resourcesDir = await ensureResourcesDir();
  const id = randomUUID();
  const ext = path.extname(sourcePath) || '';
  const destName = `${id}${ext}`;
  const destAbsolute = path.join(resourcesDir, destName);
  const destRelative = path.join('resources', destName).replace(/\\/g, '/');

  await fs.copyFile(sourcePath, destAbsolute);

  return {
    id,
    destAbsolute,
    destRelative,
    originalName: path.basename(sourcePath),
    ext: ext.replace('.', '').toLowerCase(),
  };
}

export async function deleteResourceFile(relativePath: string) {
  if (!relativePath) {
    return;
  }

  const { resourcesDir } = getPaths();
  const base = path.resolve(resourcesDir);
  const normalized = relativePath.replace(/^[/\\]+/, '');
  const target = path.resolve(resourcesDir, normalized);

  if (!target.startsWith(base)) {
    throw new Error('Invalid resource path');
  }

  try {
    await fs.unlink(target);
  } catch (error: any) {
    if (error?.code === 'ENOENT') {
      return;
    }
    throw error;
  }
}
