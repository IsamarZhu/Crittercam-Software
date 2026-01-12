// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from 'electron';

// expose IPC APIs to renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  getVideoMetadata: (filePath) => ipcRenderer.invoke('get-video-metadata', filePath),
  selectVideoFolder: () => ipcRenderer.invoke('select-video-folder'),
});