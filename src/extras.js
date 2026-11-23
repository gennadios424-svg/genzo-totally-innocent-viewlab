(() => {
  const $ = (id) => document.getElementById(id);
  const panel = $("settingsPanel");
  const messages = $("messages");
  $("settingsBtn").addEventListener("click", () => { panel.hidden = !panel.hidden; });
  $("settingsClose").addEventListener("click", () => { panel.hidden = true; });
  $("showBadges").addEventListener("change", e => messages.classList.toggle("hide-badges", !e.target.checked));
  $("showLevels").addEventListener("change", e => messages.classList.toggle("hide-levels", !e.target.checked));
  $("compactChat").addEventListener("change", e => messages.classList.toggle("compact", e.target.checked));
  $("clearChat").addEventListener("click", () => {
    messages.replaceChildren();
    const note = document.createElement("div");
    note.className = "system-message";
    note.textContent = "Chat cleared";
    messages.appendChild(note);
    $("notice").textContent = "Chat cleared.";
  });
  const events = [
    ["SUB","Nova just subscribed!"],
    ["GIFT","PixelKing gifted 5 community subs!"],
    ["RAID","A raid of 247 viewers just arrived!"],
    ["CHEER","Shadow cheered 1,000 bits!"],
    ["MILESTONE","The stream reached a new viewer milestone!"]
  ];
  function addEvent() {
    const [kind, message] = events[Math.floor(Math.random() * events.length)];
    const row = document.createElement("div");
    row.className = "system-message stream-event";
    const tag = document.createElement("strong");
    tag.textContent = kind + "  ";
    row.append(tag, document.createTextNode(message));
    messages.appendChild(row);
    while (messages.children.length > 160) messages.firstChild.remove();
    messages.scrollTop = messages.scrollHeight;
  }
  $("testEvent").addEventListener("click", addEvent);
  let eventTimer = setInterval(() => {
    if (!$("showEvents").checked || $("pauseBtn").textContent === "Resume chat") return;
    if (Math.random() < 0.035) addEvent();
  }, 1800);
  window.addEventListener("beforeunload", () => clearInterval(eventTimer));
})();