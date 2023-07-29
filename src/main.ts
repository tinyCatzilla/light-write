import { app, BrowserWindow, Menu, ipcMain } from 'electron'
import * as path from 'path'
import * as url from 'url'
import { mainMenu } from './menu'

let mainWindow: Electron.BrowserWindow | null


function createWindow () {
  mainWindow = new BrowserWindow({
    useContentSize: true,
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      preload: path.join(app.getAppPath(), 'dist', 'preload.js')
    },
    icon: __dirname + '../assets/images/app_icon.ico'
  })

  mainWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, '../index.html'),
      protocol: 'file:',
      slashes: true
    })
  )

  ipcMain.on('theme-change', (event, theme) => {
    // When we receive a 'theme-change' event from the renderer process,
    // send it back to the renderer process
    mainWindow?.webContents.send('theme-change', theme);
  })

  ipcMain.handle('capture-rect', async (event, rect) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    const image = await win?.webContents.capturePage({
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height
    });
    return image?.toPNG(); // toPNG returns a Buffer
  });

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  Menu.setApplicationMenu(mainMenu)
}



app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})
