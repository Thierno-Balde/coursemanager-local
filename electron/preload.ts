import { contextBridge, ipcRenderer } from 'electron';

const api = {
    // Data handlers
    getData: () => ipcRenderer.invoke('data:get'),
    saveData: (data: any) => ipcRenderer.invoke('data:save', data),

    // File/shell handlers
    selectFile: () => ipcRenderer.invoke('dialog:openFile'),
    openPath: (path: string) => ipcRenderer.invoke('shell:openPath', path),
};

// Expose under the expected name for the renderer
contextBridge.exposeInMainWorld('electronAPI', api);
// Keep the previous alias for backward compatibility if used elsewhere
contextBridge.exposeInMainWorld('api', api);
