import { app } from 'electron';
import fs from 'fs/promises';
import path from 'path';
import { existsSync, readFileSync } from 'fs';

const DB_FILENAME = 'coursedata.json';
const RESOURCES_DIRNAME = 'resources';
const CONFIG_FILENAME = 'config.json';

type StoragePaths = {
  userDataPath: string;
  dbPath: string;
  resourcesDir: string;
  seedDbPath: string;
  rootDirectory: string;
};

type AppConfig = {
  rootDirectory?: string;
};

function getConfigFile(): string {
  return path.join(app.getPath('userData'), CONFIG_FILENAME);
}

function loadConfig(): AppConfig {
  const configPath = getConfigFile();
  try {
    if (existsSync(configPath)) {
      const data = readFileSync(configPath, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Failed to load config:', error);
  }
  return {};
}

export async function saveConfig(config: AppConfig) {
  const configPath = getConfigFile();
  await fs.writeFile(configPath, JSON.stringify(config, null, 2), 'utf-8');
}

function getPaths(): StoragePaths {
  const userDataPath = app.getPath('userData');
  const config = loadConfig();

  // Use configured root directory or default to userData
  const rootDirectory = config.rootDirectory || userDataPath;

  const dbPath = path.join(rootDirectory, DB_FILENAME);
  const resourcesDir = path.join(rootDirectory, RESOURCES_DIRNAME);
  const basePath = app.isPackaged ? process.resourcesPath : app.getAppPath();
  const seedDbPath = path.join(basePath, 'data', 'db.json');

  return { userDataPath, dbPath, resourcesDir, seedDbPath, rootDirectory };
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

  // Only copy seed if it exists
  try {
    await fs.access(seedDbPath);
    await fs.copyFile(seedDbPath, dbPath);
  } catch (e) {
    console.log('No seed database found, skipping seed.');
    // Create empty db if no seed
    await fs.writeFile(dbPath, JSON.stringify({ courses: [] }, null, 2));
  }
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
  try {
    const data = await fs.readFile(dbPath, 'utf-8');
    return JSON.parse(data) as T;
  } catch (error) {
    // If file doesn't exist, return empty structure
    return { courses: [] } as unknown as T;
  }
}

export async function writeData(data: unknown) {
  const { dbPath } = getPaths();
  await fs.writeFile(dbPath, JSON.stringify(data, null, 2), 'utf-8');
}

export async function setRootDirectory(newPath: string) {
  await saveConfig({ rootDirectory: newPath });
  // Re-initialize storage in the new location
  await initializeStorage();
}

export { getPaths };
