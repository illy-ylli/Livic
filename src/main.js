const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');

function createWindow() {
const win = new BrowserWindow({
  width: 1280,
  height: 720,
  title: 'Livic',
  show: false,
  backgroundColor: '#000',
  icon: path.join(__dirname, '..', 'assets', 'icon.ico'),
  webPreferences: {
    nodeIntegration: true
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
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

