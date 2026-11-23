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
          { type: "input_text", text: "You are the context-aware AI brain for a lively livestream-style chat. First identify what kind of content is visibly on screen (game, browser, video, desktop app, or other activity). Notice concrete events, goals, changes, mistakes, achievements, menus, or useful details. Then write 1-2 short, natural chat messages that fit what is actually visible. Be conversational, varied, witty when appropriate, and useful occasionally. If advice would help, make one concise suggestion. Never assume the user is playing Minecraft or any particular game. Never invent unseen events, text, scores, identities, or actions. If the screen is unclear, say so naturally. Avoid repeating previous generic reactions. Keep the response under 45 words." },
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