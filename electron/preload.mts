import { contextBridge, ipcRenderer } from 'electron';

const api = {
    // Data handlers
    getFormations: () => ipcRenderer.invoke('formations:get'),
    saveFormations: (data: any) => ipcRenderer.invoke('formations:save', data),
    getGroups: () => ipcRenderer.invoke('groups:get'),
    createGroup: (group: any) => ipcRenderer.invoke('groups:create', group),
    saveGroups: (groups: any) => ipcRenderer.invoke('groups:save', groups),
    updateGroupProgress: (data: any) => ipcRenderer.invoke('groups:update-progress', data),
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
