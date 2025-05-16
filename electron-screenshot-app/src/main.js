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
    width: 1200,
    height: 800,
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

function createSelectionWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  
  selectionWindow = new BrowserWindow({
    width,
    height,
    x: 0,
    y: 0,
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
}

async function captureScreen() {
  const sources = await desktopCapturer.getSources({
    types: ['screen'],
    thumbnailSize: screen.getPrimaryDisplay().workAreaSize
  });
  
  return sources[0].thumbnail.toDataURL();
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
        const screenshot = await captureScreen();

        createSelectionWindow();
        
        // Send the screenshot data to the selection window
        selectionWindow.webContents.on('did-finish-load', () => {
          selectionWindow.webContents.send('screenshot-data', {
            image: screenshot,
            bounds: { x: 0, y: 0, width, height }
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
ipcMain.on('take-screenshot', async () => {
  if (mainWindow) {
    mainWindow.hide();
    setTimeout(async () => {
      // Capture the entire screen first
      const { width, height } = screen.getPrimaryDisplay().workAreaSize;
      const screenshot = await captureScreen();

      createSelectionWindow();
      
      // Send the screenshot data to the selection window
      selectionWindow.webContents.on('did-finish-load', () => {
        selectionWindow.webContents.send('screenshot-data', {
          image: screenshot,
          bounds: { x: 0, y: 0, width, height }
        });
      });
    }, 100);
  }
});

ipcMain.on('capture-screen', async (event, bounds) => {
  if (!bounds) {
    // If no bounds provided, capture the entire screen
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;
    bounds = { x: 0, y: 0, width, height };
  }

  const { x, y, width, height } = bounds;
  const screenshot = await captureScreen();

  if (selectionWindow) {
    selectionWindow.close();
    selectionWindow = null;
  }

  mainWindow.show();
  mainWindow.webContents.send('screenshot-captured', {
    image: screenshot,
    bounds: { x, y, width, height }
  });
});

ipcMain.on('cancel-screenshot', () => {
  if (selectionWindow) {
    selectionWindow.close();
    selectionWindow = null;
  }
  mainWindow.show();
});

ipcMain.on('save-settings', (event, settings) => {
  store.set('settings', settings);
});

ipcMain.on('load-settings', (event) => {
  const settings = store.get('settings');
  event.reply('settings-loaded', settings);
}); 