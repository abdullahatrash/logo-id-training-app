const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const path = require('path')
const { exec } = require('child_process')

let mainWindow

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  })

  mainWindow.loadFile('index.html')
}

app.on('ready', createWindow)

ipcMain.on('run-start-script', async (event) => {
  const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [{ name: 'Shell Scripts', extensions: ['sh'] }]
  })

  if (!canceled && filePaths.length > 0) {
    const scriptPath = filePaths[0]
    exec(`bash ${scriptPath}`, (error, stdout, stderr) => {
      if (error) {
        event.reply('script-result', `Error: ${error.message}`)
        return
      }
      if (stderr) {
        event.reply('script-result', `Error: ${stderr}`)
        return
      }
      event.reply('script-result', `The script executed successfully: ${stdout}`)
    })
  }
})

ipcMain.on('select-dataset', async (event) => {
  const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory']
  })

  if (!canceled && filePaths.length > 0) {
    const datasetDir = filePaths[0]
    event.reply('dataset-selected', `Dataset directory: ${datasetDir}`)
  }
})
