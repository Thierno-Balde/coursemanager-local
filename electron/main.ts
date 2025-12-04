import { app, BrowserWindow, ipcMain, dialog, shell, IpcMainInvokeEvent } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeStorage, readData, writeData } from './storage.js';
import { copyResourceFile, deleteResourceFile } from './fileManager.js';
import { getPaths } from './storage.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let mainWindow: BrowserWindow | null = null;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, 'preload.mjs'),
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: false,
            webSecurity: false, // INSECURE: FOR DEBUGGING ONLY
        },
    });

    console.log('Preload path:', path.join(__dirname, 'preload.mjs'));

    // In development, load the vite dev server
    if (process.env.NODE_ENV === 'development') {
        mainWindow.loadURL('http://localhost:5173');
    } else {
        // In production, load the index.html from the dist folder
        mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    }
}

app.whenReady().then(async () => {
    await initializeStorage();
    createWindow();

    // --- IPC Handlers for Data ---
    ipcMain.handle('data:get', async () => {
        try {
            return await readData();
        } catch (error) {
            console.error('Failed to read data:', error);
            // If the file doesn't exist or is corrupted, return a default structure
            return { courses: [] };
        }
    });

    ipcMain.handle('data:save', async (_event, dataToSave) => {
        try {
            await writeData(dataToSave);
            return { success: true };
        } catch (error) {
            console.error('Failed to save data:', error);
            return { success: false, error: (error as Error).message };
        }
    });

    // IPC Handler: Open File Dialog
    ipcMain.handle('dialog:openFile', async () => {
        const result = await dialog.showOpenDialog({
            properties: ['openFile'],
        });

        if (result.canceled || result.filePaths.length === 0) {
            return null;
        }

        const filePath = result.filePaths[0];
        const fileName = path.basename(filePath);

        return { path: filePath, name: fileName };
    });

    // IPC Handler: Open Directory Dialog
    ipcMain.handle('dialog:openDirectory', async () => {
        const result = await dialog.showOpenDialog({
            properties: ['openDirectory'],
        });

        if (result.canceled || result.filePaths.length === 0) {
            return null;
        }

        return result.filePaths[0];
    });

    // IPC Handler: Get App Version
    ipcMain.handle('app:getVersion', () => {
        return app.getVersion();
    });

    // Synchronous getter for resources directory (renderer uses it to rebuild paths)
    ipcMain.on('resources:getDir', (event) => {
        const { resourcesDir } = getPaths();
        event.returnValue = resourcesDir;
    });

    // IPC Handler: Import a resource file (copy to userData/resources)
    ipcMain.handle('resources:importFile', async () => {
        const result = await dialog.showOpenDialog({
            properties: ['openFile'],
        });

        if (result.canceled || result.filePaths.length === 0) {
            return null;
        }

        const filePath = result.filePaths[0];

        try {
            const copyResult = await copyResourceFile(filePath);
            return {
                id: copyResult.id,
                name: copyResult.originalName,
                format: copyResult.ext,
                absolutePath: copyResult.destAbsolute,
                relativePath: copyResult.destRelative,
            };
        } catch (error) {
            console.error('Failed to import resource file:', error);
            return { error: (error as Error).message };
        }
    });

    // IPC Handler: Delete a resource file by relative path
    ipcMain.handle('resources:deleteFile', async (_event, relativePath: string) => {
        if (!relativePath) {
            return { success: false, error: 'No path provided' };
        }

        try {
            await deleteResourceFile(relativePath);
            return { success: true };
        } catch (error) {
            console.error('Failed to delete resource file:', error);
            return { success: false, error: (error as Error).message };
        }
    });

    // IPC Handler: Set Root Directory
    ipcMain.handle('settings:setRoot', async (_event, newPath: string) => {
        try {
            const { setRootDirectory } = await import('./storage.js');
            await setRootDirectory(newPath);
            return { success: true };
        } catch (error) {
            console.error('Failed to set root directory:', error);
            return { success: false, error: (error as Error).message };
        }
    });

    // IPC Handler: Get Root Directory
    ipcMain.handle('settings:getRoot', async () => {
        const { getPaths } = await import('./storage.js');
        const { rootDirectory } = getPaths();
        return rootDirectory;
    });

    // IPC Handler: Open Path (File or Folder)
    ipcMain.handle('shell:openPath', async (_event: IpcMainInvokeEvent, path: string) => {
        const error = await shell.openPath(path);
        return error;
    });

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
