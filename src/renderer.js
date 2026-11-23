const $ = (id) => document.getElementById(id);
const messages = $("messages");
const namesA = ["Pixel","Shadow","Nova","Ghost","Frost","Alex","Mango","Orbit","Lunar","Vex","Toast","Echo","Raven","Noodle","Comet","Blitz","Misty","Turbo","Koda","Zenix"];
const namesB = ["King","Plays","Live","TV","GG","XD","Fan","Main","_","YT","123","Rush","FPS","Vibes","Clips","Zero"];
const colors = ["#d9a5ff","#79c7ff","#ffb36b","#78dca7","#e7a0b5","#f2d36f","#9da7ff","#ff8f8f"];
const reactions = [
  "YOOOO", "W PLAY 🔥", "NAHHH 💀", "CLIP THAT", "WHAT JUST HAPPENED", "LMAOOO",
  "that was close", "CHAT??", "no way 😭", "clean", "bro is locked in", "I WAS NOT READY",
  "actually insane", "one more time", "huge W", "that's an L", "WAIT WAIT WAIT",
  "how did that work", "we take those", "this is getting interesting", "BRO LOOK",
  "I leave for 2 seconds", "nah you're joking", "someone explain 😭", "absolute cinema"
];
const conversations = [
  ["PixelKing","that was close"],["Shadow","nah he had that"],["Nova","CHAT LOOK AT THIS"],
  ["Alex","I knew that was coming"],["Ghost","clip it"],["Toast","😭😭😭"],
  ["Frost","what's the plan now"],["Mango","we are so back"],["Orbit","not the timing 💀"]
];
const profiles = new Map();
let paused = false;
let screenStream = null;
let analysisTimer = null;
let pinned = true;
let lastAIAt = 0;

function hash(n) { let x = Math.imul(n ^ 0x45d9f3b, 0x45d9f3b); x = Math.imul(x ^ (x >>> 16), 0x45d9f3b); return (x ^ (x >>> 16)) >>> 0; }
function profileFor(id) {
  if (profiles.has(id)) return profiles.get(id);
  const h = hash(id);
  const name = namesA[h % namesA.length] + namesB[(h >>> 5) % namesB.length] + (h % 7 === 0 ? String(h % 999) : "");
  const roll = (h >>> 10) % 100;
  const badges = [];
  if (roll < 3) badges.push(["MOD","mod"]);
  else if (roll < 7) badges.push(["VIP","vip"]);
  else if (roll < 28) badges.push(["SUB","sub"]);
  if ((h >>> 15) % 100 < 4) badges.push(["GIFTED","gift"]);
  if ((h >>> 19) % 100 < 2) badges.push(["FOUNDER","founder"]);
  const p = { name, color: colors[(h >>> 22) % colors.length], level: 1 + ((h >>> 3) % 100), badges };
  profiles.set(id, p);
  return p;
}
function addMessage(profile, text, isAI = false) {
  const row = document.createElement("div");
  row.className = "message";
  const name = document.createElement("span");
  name.className = "name";
  name.style.color = isAI ? "#b69cff" : profile.color;
  name.textContent = isAI ? "GenzoAI" : profile.name;
  row.appendChild(name);
  if (!isAI) {
    for (const [label, cls] of profile.badges) {
      const badge = document.createElement("span");
      badge.className = "badge " + cls;
      badge.textContent = label;
      row.appendChild(badge);
    }
    const level = document.createElement("span");
    level.className = "badge level";
    level.textContent = "LVL " + profile.level;
    row.appendChild(level);
  }
  const body = document.createElement("span");
  body.className = "message-text";
  body.textContent = text;
  row.appendChild(body);
  messages.appendChild(row);
  while (messages.children.length > 160) messages.firstChild.remove();
  messages.scrollTop = messages.scrollHeight;
}
function addSystem(text) {
  const el = document.createElement("div");
  el.className = "system-message";
  el.textContent = text;
  messages.appendChild(el);
  messages.scrollTop = messages.scrollHeight;
}
let messageIndex = 0;
function nextMessage() {
  const h = hash(messageIndex++ + Math.floor(Date.now() / 17000));
  const profile = profileFor(h % 32000);
  let text = reactions[h % reactions.length];
  if (h % 9 === 0) {
    const pair = conversations[(h >>> 7) % conversations.length];
    text = pair[1];
  }
  addMessage(profile, text);
}
function updateViewers() {
  const current = Number($("viewerCount").dataset.value || 32000);
  const next = Math.max(31800, Math.min(32350, current + Math.floor(Math.random() * 91) - 45));
  $("viewerCount").dataset.value = String(next);
  $("viewerCount").textContent = next.toLocaleString("en-US");
}
const chatLoop = setInterval(() => { if (!paused) { const burst = 1 + Math.floor(Math.random() * 3); for (let i=0;i<burst;i++) nextMessage(); } }, 420);
setInterval(updateViewers, 1700);
for (let i=0;i<18;i++) nextMessage();

$("minBtn").addEventListener("click", () => window.genzo.minimize());
$("closeBtn").addEventListener("click", () => window.genzo.close());
$("pinBtn").addEventListener("click", () => {
  pinned = !pinned; window.genzo.setAlwaysOnTop(pinned);
  $("pinBtn").style.color = pinned ? "#c4a2ff" : "#dedee3";
  $("notice").textContent = pinned ? "Always on top enabled." : "Always on top disabled.";
});
$("pauseBtn").addEventListener("click", () => {
  paused = !paused; $("pauseBtn").textContent = paused ? "Resume chat" : "Pause chat";
  $("notice").textContent = paused ? "Chat paused." : "Chat resumed.";
});

async function analyzeScreenFrame() {
  if (!screenStream || !screenStream.active || Date.now() - lastAIAt < 14000) return;
  const video = document.querySelector("#captureVideo");
  if (!video || video.readyState < 2 || !video.videoWidth) return;
  lastAIAt = Date.now();
  const canvas = document.createElement("canvas");
  const scale = Math.min(1, 640 / video.videoWidth);
  canvas.width = Math.round(video.videoWidth * scale);
  canvas.height = Math.round(video.videoHeight * scale);
  canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
  $("notice").textContent = "Thinking about what's on screen…";
  try {
    const result = await window.genzo.analyzeFrame(canvas.toDataURL("image/jpeg", 0.55));
    if (result.ok && result.text) addMessage(null, result.text, true);
    else $("notice").textContent = result.error || "Screen analysis unavailable.";
  } catch (error) {
    $("notice").textContent = "Screen analysis failed: " + error.message;
  }
}
$("screenBtn").addEventListener("click", async () => {
  if (screenStream) {
    screenStream.getTracks().forEach(track => track.stop());
    screenStream = null;
    document.querySelector("#captureVideo")?.remove();
    clearInterval(analysisTimer); analysisTimer = null;
    $("screenBtn").textContent = "Share screen";
    $("screenStatus").textContent = "SCREEN OFF";
    $("screenStatus").classList.remove("on");
    $("notice").textContent = "Screen sharing stopped.";
    return;
  }
  try {
    screenStream = await navigator.mediaDevices.getDisplayMedia({ video: { frameRate: 5 }, audio: false });
    const video = document.createElement("video");
    video.id = "captureVideo"; video.srcObject = screenStream; video.muted = true;
    video.style.display = "none"; document.body.appendChild(video);
    await video.play();
    screenStream.getVideoTracks()[0].addEventListener("ended", () => $("screenBtn").click(), { once: true });
    $("screenBtn").textContent = "Stop sharing";
    $("screenStatus").textContent = "SCREEN ON";
    $("screenStatus").classList.add("on");
    $("notice").textContent = "Screen shared. AI checks approximately every 14 seconds.";
    addSystem("Screen sharing started");
    analysisTimer = setInterval(analyzeScreenFrame, 14000);
    analyzeScreenFrame();
  } catch (error) {
    screenStream = null;
    $("notice").textContent = "Screen sharing was cancelled or unavailable.";
  }
});
window.addEventListener("beforeunload", () => {
  if (screenStream) screenStream.getTracks().forEach(track => track.stop());
  clearInterval(chatLoop); clearInterval(analysisTimer);
});