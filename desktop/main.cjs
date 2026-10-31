/*
  Vector's desktop app (Windows). This tiny file opens the app in its own
  window. The app itself is app/index.html, the same single-file build made
  by `npm run build:file`, so the desktop app and the web app never drift apart.

  Progress is saved in the app's own storage (in %APPDATA%\Vector), so it
  sticks around between launches.
*/
const { app, BrowserWindow, Menu, shell, nativeTheme } = require('electron')
const path = require('node:path')

// Only one Vector window at a time: launching it again just focuses it.
if (!app.requestSingleInstanceLock()) app.quit()

let win = null

function createWindow() {
  win = new BrowserWindow({
    width: 1200,
    height: 820,
    minWidth: 380,
    minHeight: 600,
    title: 'Vector',
    icon: path.join(__dirname, 'icon.png'),
    backgroundColor: nativeTheme.shouldUseDarkColors ? '#131a20' : '#ffffff',
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      spellcheck: false,
    },
  })

  // No File/Edit/View menu. It's an app, not a browser.
  Menu.setApplicationMenu(null)
  win.once('ready-to-show', () => win.show())
  win.loadFile(path.join(__dirname, 'app', 'index.html'))

  // Website links (like studentaid.gov in a lesson) open in the normal browser.
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:\/\//.test(url)) shell.openExternal(url)
    return { action: 'deny' }
  })
  win.webContents.on('will-navigate', (event, url) => {
    if (url.startsWith('file://')) return
    event.preventDefault()
    if (/^https?:\/\//.test(url)) shell.openExternal(url)
  })

  win.on('closed', () => {
    win = null
  })
}

app.on('second-instance', () => {
  if (!win) return
  if (win.isMinimized()) win.restore()
  win.focus()
})

app.whenReady().then(createWindow)
app.on('window-all-closed', () => app.quit())
