import { app } from 'electron';
import fs from 'fs/promises';
import path from 'path';

const DB_FILENAME = 'coursedata.json';
const RESOURCES_DIRNAME = 'resources';

type StoragePaths = {
  userDataPath: string;
  dbPath: string;
  resourcesDir: string;
  seedDbPath: string;
};

function getPaths(): StoragePaths {
  const userDataPath = app.getPath('userData');
  const dbPath = path.join(userDataPath, DB_FILENAME);
  const resourcesDir = path.join(userDataPath, RESOURCES_DIRNAME);
  const basePath = app.isPackaged ? process.resourcesPath : app.getAppPath();
  const seedDbPath = path.join(basePath, 'data', 'db.json');

  return { userDataPath, dbPath, resourcesDir, seedDbPath };
}

async function ensureResourcesDir(resourcesDir: string) {
  await fs.mkdir(resourcesDir, { recursive: true });
}

async function ensureDatabaseSeed(dbPath: string, seedDbPath: string) {
  try {
    await fs.access(dbPath);
    return;
  } catch {
    // No db yet, fall through to copy
  }

  await fs.copyFile(seedDbPath, dbPath);
}

export async function initializeStorage() {
  const { resourcesDir, dbPath, seedDbPath } = getPaths();

  await ensureResourcesDir(resourcesDir);

  try {
    await ensureDatabaseSeed(dbPath, seedDbPath);
  } catch (error) {
    console.error(`Failed to seed database from ${seedDbPath}:`, error);
  }
}

export async function readData<T = unknown>(): Promise<T> {
  const { dbPath } = getPaths();
  const data = await fs.readFile(dbPath, 'utf-8');
  return JSON.parse(data) as T;
}

export async function writeData(data: unknown) {
  const { dbPath } = getPaths();
  await fs.writeFile(dbPath, JSON.stringify(data, null, 2), 'utf-8');
}

export { getPaths };
