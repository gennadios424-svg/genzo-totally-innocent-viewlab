const { app, BrowserWindow, ipcMain, screen } = require("electron");
const path = require("path");
require("dotenv").config();

let win;

function createWindow() {
  const display = screen.getPrimaryDisplay();
  const area = display.workArea;
  win = new BrowserWindow({
    width: 390,
    height: 650,
    x: area.x + area.width - 410,
    y: area.y + 30,
    minWidth: 320,
    minHeight: 420,
    frame: false,
    transparent: false,
    backgroundColor: "#18181b",
    alwaysOnTop: true,
    skipTaskbar: false,
    resizable: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });
  win.setAlwaysOnTop(true, "floating");
  win.loadFile(path.join(__dirname, "index.html"));
}

app.whenReady().then(() => {
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

ipcMain.on("window:minimize", () => win?.minimize());
ipcMain.on("window:close", () => win?.close());
ipcMain.on("window:toggle-top", (_event, enabled) => {
  if (win && !win.isDestroyed()) win.setAlwaysOnTop(Boolean(enabled), "floating");
});

ipcMain.handle("ai:analyze", async (_event, imageDataUrl) => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return { ok: false, error: "Add OPENAI_API_KEY to your local .env file to enable screen commentary." };
  if (typeof imageDataUrl !== "string" || !imageDataUrl.startsWith("data:image/")) {
    return { ok: false, error: "No valid screenshot received." };
  }

  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model,
      max_output_tokens: 120,
      input: [{
        role: "user",
        content: [
          { type: "input_text", text: "You are a lively, observant livestream chat commentator. Briefly describe one interesting thing visible on this screen and write one short, natural chat-style reaction. Be general: understand any game, app, video, or desktop activity. Do not claim certainty about details you cannot see. Keep it under 25 words." },
          { type: "input_image", image_url: imageDataUrl, detail: "low" }
        ]
      }]
    })
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = data?.error?.message || `OpenAI request failed (${response.status}).`;
    return { ok: false, error: message };
  }
  const output = (data.output || [])
    .flatMap(item => item.content || [])
    .filter(item => item.type === "output_text")
    .map(item => item.text)
    .join("\n")
    .trim();
  return { ok: true, text: output || "CHAT WHAT JUST HAPPENED?" };
});