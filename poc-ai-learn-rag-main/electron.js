/**
 * Electron main process.
 *
 * 1. Sets DATA_DIR (and DOTENV_PATH) before any module is required.
 * 2. Loads app_config.json and propagates all config values as env vars.
 * 3. Starts the Express server.
 * 4. Opens a BrowserWindow routed to /setup (first run) or / (ready).
 */

const { app, BrowserWindow } = require('electron');
const path = require('path');

const isDev = !app.isPackaged;

// ── Step 1: Set path env vars before anything else ─────────────────────────
if (isDev) {
  process.env.DATA_DIR    = path.join(__dirname, 'data');
  process.env.DOTENV_PATH = path.join(__dirname, '.env');
} else {
  process.env.DATA_DIR    = path.join(app.getPath('userData'), 'data');
  process.env.DOTENV_PATH = path.join(app.getPath('userData'), '.env');
}

// ── Step 2: Load stored config and set all env vars ────────────────────────
const { readConfig, configToEnv } = require('./src/config/config');
const cfg = readConfig();
Object.assign(process.env, configToEnv(cfg));

// ── Step 3: Start Express server ───────────────────────────────────────────
require('./src/api/server');

// ── Step 4: Create browser window ──────────────────────────────────────────
let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    title: cfg.app && cfg.app.name ? cfg.app.name : 'Knowledge Hub',
    autoHideMenuBar: true,
  });

  const PORT     = process.env.PORT || 3000;
  const startUrl = cfg.setupComplete
    ? `http://localhost:${PORT}`
    : `http://localhost:${PORT}/setup`;

  mainWindow.loadURL(startUrl);

  // Retry if server isn't ready yet
  mainWindow.webContents.on('did-fail-load', () => {
    setTimeout(() => mainWindow.loadURL(startUrl), 1500);
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
