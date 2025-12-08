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
  groupsPath: string;
  resourcesDir: string;
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
  const groupsPath = path.join(rootDirectory, 'groups.json');
  const resourcesDir = path.join(rootDirectory, RESOURCES_DIRNAME);
  const basePath = app.isPackaged ? process.resourcesPath : app.getAppPath();

  return { userDataPath, dbPath, groupsPath, resourcesDir, rootDirectory };
}

async function ensureResourcesDir(resourcesDir: string) {
  await fs.mkdir(resourcesDir, { recursive: true });
}

async function ensureFileExists(filePath: string, defaultContent: string) {
  try {
    await fs.access(filePath);
  } catch {
    await fs.writeFile(filePath, defaultContent);
  }
}

export async function initializeStorage() {
  const { resourcesDir, dbPath, groupsPath } = getPaths();

  await ensureResourcesDir(resourcesDir);
  await ensureFileExists(dbPath, JSON.stringify({ formations: [] }, null, 2));
  await ensureFileExists(groupsPath, JSON.stringify([], null, 2));
}

export async function readJsonFile<T = unknown>(filePath: string, defaultData: T): Promise<T> {
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data) as T;
  } catch (error) {
    return defaultData;
  }
}

export async function writeJsonFile(filePath: string, data: unknown) {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

export async function setRootDirectory(newPath: string) {
  await saveConfig({ rootDirectory: newPath });
  // Re-initialize storage in the new location
  await initializeStorage();
}

export { getPaths };
