const { app, BrowserWindow, ipcMain, screen, globalShortcut, desktopCapturer } = require('electron');
const path = require('path');
const Store = require('electron-store');

// Enable hot reloading in development
if (process.env.NODE_ENV === 'development') {
  try {
    require('electron-reloader')(module, {
      debug: true,
      watchRenderer: true
    });
  } catch (_) { console.log('Error'); }
}

const store = new Store();

let mainWindow = null;
let selectionWindow = null;

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    icon: path.join(__dirname, '../assets/icon.png')
  });

  // Set the base path for assets
  mainWindow.webContents.session.webRequest.onBeforeRequest((details, callback) => {
    if (details.url.startsWith('file:///assets/')) {
      const assetPath = path.join(__dirname, '..', details.url.replace('file:///assets/', ''));
      callback({ redirectURL: `file://${assetPath}` });
    } else {
      callback({});
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'index.html'));
  
  // Open DevTools in development
  if (process.argv.includes('--debug')) {
    mainWindow.webContents.openDevTools();
  }
}

function createSelectionWindow(bounds, scaleFactor) {
  selectionWindow = new BrowserWindow({
    x: bounds.x,
    y: bounds.y,
    width: bounds.width,
    height: bounds.height,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  selectionWindow.loadFile(path.join(__dirname, 'selection.html'));
  selectionWindow.setIgnoreMouseEvents(false);
  return selectionWindow;
}

async function captureScreen() {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;
  const scaleFactor = primaryDisplay.scaleFactor;

  const sources = await desktopCapturer.getSources({
    types: ['screen'],
    thumbnailSize: {
      width: width * scaleFactor,
      height: height * scaleFactor
    }
  });
  
  return {
    image: sources[0].thumbnail.toDataURL(),
    scaleFactor
  };
}

app.whenReady().then(() => {
  createMainWindow();

  // Register global shortcut for taking screenshots
  globalShortcut.register('CommandOrControl+Shift+S', () => {
    if (mainWindow) {
      mainWindow.hide();
      setTimeout(async () => {
        // Capture the entire screen first
        const { width, height } = screen.getPrimaryDisplay().workAreaSize;
        const { image, scaleFactor } = await captureScreen();

        createSelectionWindow({ x: 0, y: 0, width, height }, scaleFactor);
        
        // Send the screenshot data to the selection window
        selectionWindow.webContents.on('did-finish-load', () => {
          selectionWindow.webContents.send('screenshot-data', {
            image,
            bounds: { x: 0, y: 0, width, height },
            scaleFactor
          });
        });
      }, 100);
    }
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC handlers
ipcMain.on('start-screenshot', () => {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { bounds, scaleFactor } = primaryDisplay;

  createSelectionWindow(bounds, scaleFactor);
});

ipcMain.on('screenshot-data', (event, data) => {
  if (selectionWindow) {
    selectionWindow.webContents.send('screenshot-data', {
      image: data.image,
      bounds: data.bounds,
      scaleFactor: data.scaleFactor
    });
  }
});

ipcMain.on('capture-screen', (event, selection) => {
  if (mainWindow) {
    mainWindow.webContents.send('screenshot-captured', selection);
  }
  if (selectionWindow) {
    selectionWindow.close();
  }
});

ipcMain.on('cancel-screenshot', () => {
  if (selectionWindow) {
    selectionWindow.close();
  }
});

ipcMain.on('save-settings', (event, settings) => {
  store.set('settings', settings);
});

ipcMain.on('load-settings', (event) => {
  const settings = store.get('settings');
  event.reply('settings-loaded', settings);
}); 