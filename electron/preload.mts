import { contextBridge, ipcRenderer } from 'electron';

const api = {
    // Data handlers
    getData: () => ipcRenderer.invoke('data:get'),
    saveData: (data: any) => ipcRenderer.invoke('data:save', data),
    getResourcesDir: () => ipcRenderer.sendSync('resources:getDir'),

    // File/shell handlers
    selectFile: () => ipcRenderer.invoke('dialog:openFile'),
    selectDirectory: () => ipcRenderer.invoke('dialog:openDirectory'),
    openPath: (path: string) => ipcRenderer.invoke('shell:openPath', path),

    // Resources
    importFile: () => ipcRenderer.invoke('resources:importFile'),
    deleteResource: (relativePath: string) => ipcRenderer.invoke('resources:deleteFile', relativePath),

    // Settings
    setRoot: (path: string) => ipcRenderer.invoke('settings:setRoot', path),
    getRoot: () => ipcRenderer.invoke('settings:getRoot'),

    // Utils
    getAppVersion: () => ipcRenderer.invoke('app:getVersion'),
};

// Expose under the expected name for the renderer
contextBridge.exposeInMainWorld('electronAPI', api);
// Keep the previous alias for backward compatibility if used elsewhere
contextBridge.exposeInMainWorld('api', api);
