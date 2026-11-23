const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("genzo", {
  minimize: () => ipcRenderer.send("window:minimize"),
  close: () => ipcRenderer.send("window:close"),
  setAlwaysOnTop: (enabled) => ipcRenderer.send("window:toggle-top", enabled),
  analyzeFrame: (imageDataUrl) => ipcRenderer.invoke("ai:analyze", imageDataUrl)
});