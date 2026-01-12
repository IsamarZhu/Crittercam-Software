import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import started from 'electron-squirrel-startup';
import fs from 'node:fs';
import ffmpeg from 'fluent-ffmpeg';
import ffprobeStatic from 'ffprobe-static';

// Resolve ffprobe path for both dev and packaged (asar) builds
const resolveFfprobePath = () => {
  const binSuffix = ffprobeStatic.path.split(`${path.sep}bin${path.sep}`).pop();

  const pos_paths = [
    ffprobeStatic.path, // default
    path.join(process.cwd(), 'node_modules', 'ffprobe-static', 'bin', binSuffix), // dev cwd
  ].filter(Boolean);

  for (const p of pos_paths) {
    if (fs.existsSync(p)) {
      return p;
    }
  }

  throw new Error(`ffprobe binary not found, tried: ${pos_paths.join(', ')}`);
};

ffmpeg.setFfprobePath(resolveFfprobePath());

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

// get video metadata using ffprobe
const probeVideo = (filePath) =>
  new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) return reject(err);
      resolve(metadata);
    });
  });

const buildVideoMetadata = async (filePath) => {
  const stats = fs.statSync(filePath); // file status/metadata
  const fileName = path.basename(filePath);
  const metadata = await probeVideo(filePath);
  const format = metadata?.format || {};
  
  // get info about video stream, or use empty array if no streams
  const videoStream = (metadata?.streams || []).find((s) => s.codec_type === 'video');
  
  // try to get duration from video stream first, then format, then default to 0
  const rawDuration = videoStream?.duration || format.duration || 0;
  const durationSeconds = parseFloat(rawDuration);
  
  const creationTag = format.tags?.creation_time;
  const createdAtDate = creationTag ? new Date(creationTag) : stats.birthtime;

  const startMs = createdAtDate.getTime();
  const endMs = startMs + durationSeconds * 1000;

  return {
    path: filePath,
    fileUrl: pathToFileURL(filePath).toString(),
    fileName,
    fileSize: stats.size,
    createdAt: createdAtDate.toISOString(),
    durationSeconds,
    startMs,
    endMs,
  };
};

// IPC handlers for file operations

ipcMain.handle('get-video-metadata', async (event, filePath) => {
  try {
    return await buildVideoMetadata(filePath);
  } catch (error) {
    throw new Error(`Failed to read video metadata: ${error.message}`);
  }
});

ipcMain.handle('select-video-folder', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory'],
  });

  if (result.canceled) {
    return null;
  }

  const folderPath = result.filePaths[0];
  const folderName = path.basename(folderPath);
  const folderNamePattern = /^Day.+_\d{8}_\d{6}$/; // match pattern Day1Whale1_20250611_110050

  if (!folderNamePattern.test(folderName)) {
    throw new Error('Folder name must match "Day..._YYYYMMDD_HHMMSS"');
  }

  const videoDir = path.join(folderPath, 'video');
  if (!fs.existsSync(videoDir) || !fs.statSync(videoDir).isDirectory()) {
    throw new Error('Selected folder must contain a "video" subfolder');
  }

  const entries = fs.readdirSync(videoDir)
    .filter((f) => f.toLowerCase().endsWith('.mp4'))
    .map((f) => path.join(videoDir, f));

  if (entries.length === 0) {
    throw new Error('No .mp4 files found in the "video" subfolder');
  }

  const videos = [];
  for (const filePath of entries) {
    const meta = await buildVideoMetadata(filePath);
    videos.push(meta);
  }

  videos.sort((a, b) => a.startMs - b.startMs);
  
  //get global timeline start/end across all videos
  const timelineStartMs = Math.min(...videos.map((v) => v.startMs));
  const timelineEndMs = Math.max(...videos.map((v) => v.endMs));

  return {
    folderName,
    folderPath,
    videos,
    timelineStartMs,
    timelineEndMs,
  };
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
