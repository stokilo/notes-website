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
  selectionWindow.setAlwaysOnTop(true, 'screen-saver');
  selectionWindow.setVisibleOnAllWorkspaces(true);
  
  // Open DevTools
  selectionWindow.webContents.openDevTools();
  
  return selectionWindow;
}

async function captureScreen() {
  try {
    const primaryDisplay = screen.getPrimaryDisplay();
    const { width, height } = primaryDisplay.workAreaSize;
    const scaleFactor = primaryDisplay.scaleFactor;

    console.log('Capturing screen with dimensions:', { width, height, scaleFactor });

    // Wait a bit to ensure the window is hidden
    await new Promise(resolve => setTimeout(resolve, 100));

    const sources = await desktopCapturer.getSources({
      types: ['screen'],
      thumbnailSize: {
        width: width * scaleFactor,
        height: height * scaleFactor
      }
    });
    
    if (!sources || sources.length === 0) {
      console.error('No screen sources found');
      return null;
    }

    const source = sources[0];
    const image = source.thumbnail.toDataURL();
    
    console.log('Screen captured successfully');
    return {
      image,
      scaleFactor,
      width,
      height
    };
  } catch (error) {
    console.error('Error capturing screen:', error);
    return null;
  }
}

app.whenReady().then(() => {
  createMainWindow();

  // Register global shortcut for taking screenshots
  globalShortcut.register('CommandOrControl+Shift+S', async () => {
    if (mainWindow) {
      try {
        // Hide the main window
        mainWindow.hide();
        
        // Capture the screen
        const captureResult = await captureScreen();
        if (!captureResult) {
          console.error('Failed to capture screen');
          mainWindow.show();
          return;
        }

        const { image, scaleFactor, width, height } = captureResult;
        console.log('Creating selection window with dimensions:', { width, height, scaleFactor });

        // Create selection window
        const selectionWin = createSelectionWindow({ x: 0, y: 0, width, height }, scaleFactor);
        
        // Wait for the window to load
        await new Promise(resolve => {
          selectionWin.webContents.on('did-finish-load', () => {
            console.log('Selection window loaded, sending screenshot data');
            selectionWin.webContents.send('screenshot-data', {
              image,
              bounds: { x: 0, y: 0, width, height },
              scaleFactor
            });
            resolve();
          });
        });
      } catch (error) {
        console.error('Error in screenshot process:', error);
        mainWindow.show();
      }
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
ipcMain.on('start-screenshot', async () => {
  console.log('Starting screenshot process');
  try {
    const primaryDisplay = screen.getPrimaryDisplay();
    const { bounds, scaleFactor } = primaryDisplay;

    // Hide the main window
    if (mainWindow) {
      mainWindow.hide();
    }

    // Capture the screen
    const captureResult = await captureScreen();
    if (!captureResult) {
      console.error('Failed to capture screen');
      if (mainWindow) {
        mainWindow.show();
      }
      return;
    }

    const { image } = captureResult;
    
    // Create selection window
    const selectionWin = createSelectionWindow(bounds, scaleFactor);
    
    // Wait for the window to load
    await new Promise(resolve => {
      selectionWin.webContents.on('did-finish-load', () => {
        console.log('Selection window loaded, sending screenshot data');
        selectionWin.webContents.send('screenshot-data', {
          image,
          bounds,
          scaleFactor
        });
        resolve();
      });
    });
  } catch (error) {
    console.error('Error in screenshot process:', error);
    if (mainWindow) {
      mainWindow.show();
    }
  }
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
  console.log('Capturing screen selection:', selection);
  if (mainWindow) {
    // Send the complete selection data including the image
    mainWindow.webContents.send('screenshot-captured', {
      ...selection,
      image: selection.image // Make sure we include the image data
    });
    mainWindow.show();
  }
  if (selectionWindow) {
    selectionWindow.close();
  }
});

// Add handler for getting screenshot data
ipcMain.on('get-screenshot-data', (event) => {
  console.log('Request for screenshot data received');
  if (selectionWindow) {
    selectionWindow.webContents.send('get-screenshot-data');
  }
});

// Add handler for sending screenshot data
ipcMain.on('send-screenshot-data', (event, data) => {
  console.log('Screenshot data received from selection window');
  if (mainWindow) {
    mainWindow.webContents.send('screenshot-captured', data);
  }
});

ipcMain.on('cancel-screenshot', () => {
  console.log('Screenshot cancelled');
  if (selectionWindow) {
    selectionWindow.close();
  }
  if (mainWindow) {
    mainWindow.show();
  }
});

ipcMain.on('save-settings', (event, settings) => {
  store.set('settings', settings);
});

ipcMain.on('load-settings', (event) => {
  const settings = store.get('settings');
  event.reply('settings-loaded', settings);
}); 