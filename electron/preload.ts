import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
    selectFile: () => ipcRenderer.invoke('dialog:openFile'),
    openPath: (path: string) => ipcRenderer.invoke('shell:openPath', path),
});
