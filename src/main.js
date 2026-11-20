const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const path = require('path');
const { startPlayback } = require('./playback');

let playbackSample = { state: 'Connecting to Windows playback' };
ipcMain.handle('playback:get-sample', () => playbackSample);

function createWindow() {
const win = new BrowserWindow({
  width: 1280,
  height: 720,
  title: 'Livic',
  show: false,
  backgroundColor: '#000',
  icon: path.join(__dirname, '..', 'assets', 'icon.ico'),
  webPreferences: {
    preload: path.join(__dirname, 'preload.js'),
    contextIsolation: true,
    nodeIntegration: false
  }
});

  win.loadFile('src/index.html');
win.once('ready-to-show', () => {                         // ← reveal when ready
    win.show();
  });
}


app.whenReady().then(() =>{
  Menu.setApplicationMenu(null);
  createWindow();
  const stopPlayback = startPlayback((sample) => { playbackSample = sample; });
  app.once('will-quit', stopPlayback);
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

