import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import started from 'electron-squirrel-startup';
import fs from 'node:fs';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

const createWindow = () => {
  const isDev = Boolean(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      // Allow local file playback when renderer is served via http (dev server)
      // avoid file access issues
      webSecurity: !isDev,
      allowRunningInsecureContent: isDev,
      allowFileAccessFromFileUrls: true,
    },
  });

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
};

// ipcMain handles messages from renderer process

// IPC handlers for file operations
ipcMain.handle('select-video', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [
      { name: 'MP4', extensions: ['mp4'] },
      { name: 'All Files', extensions: ['*'] } // add csv or other types when know input format
    ]
  });

  if (result.canceled) {
    return null;
  }

  const filePath = result.filePaths[0];
  
  // Verify file exists and is an mp4
  // redundant since import modal also checks, but good for robustness across layers
  if (!filePath.endsWith('.mp4')) {
    throw new Error('Selected file must be an .mp4 file');
  }

  if (!fs.existsSync(filePath)) {
    throw new Error('Selected file does not exist');
  }

  return filePath;
});

ipcMain.handle('get-video-metadata', async (event, filePath) => {
  try {
    const stats = fs.statSync(filePath);
    const fileName = path.basename(filePath);
    
    // TODO what other metadata to extract?
    return {
      path: filePath,
      fileUrl: pathToFileURL(filePath).toString(),
      fileName: fileName,
      fileSize: stats.size,
      lastModified: stats.mtime,
    };
  } catch (error) {
    throw new Error(`Failed to read video metadata: ${error.message}`);
  }
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();

  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
