const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('playback', {
  getSample: () => ipcRenderer.invoke('playback:get-sample')
});
