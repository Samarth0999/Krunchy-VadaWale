const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: true,
  printReceipt: (options) => ipcRenderer.invoke('print-receipt', options),
  toggleFullscreen: () => ipcRenderer.invoke('toggle-fullscreen'),
  getPlatform: () => ipcRenderer.invoke('get-platform')
});

