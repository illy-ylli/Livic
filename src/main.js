const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const path = require('path');
const { startPlayback } = require('./playback');
const { parseLyricsfile } = require('./lyricsfile');

let playbackSample = { state: 'Connecting to Windows playback' };
ipcMain.handle('playback:get-sample', () => playbackSample);
ipcMain.handle('lyrics:parse-lyricsfile', (_event, source) => parseLyricsfile(source));

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

  win.webContents.on('before-input-event', (event, input) => {
    if (input.type !== 'keyDown' || input.key !== 'F11') return;

    event.preventDefault();
    if (!input.isAutoRepeat) win.setFullScreen(!win.isFullScreen());
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

