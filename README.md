# Genzo ViewLab 3.0

A local Windows desktop overlay with a Twitch-inspired chat simulator and optional screen-aware AI commentary.

## Features
- Compact always-on-top Electron window.
- Fast scrolling chat with randomized chatter profiles, coloured names, levels and MOD/VIP/SUB/GIFTED/FOUNDER badges.
- A simulated community of 32,000 profile identities; profiles are generated lazily so the app does not load 32,000 active processes.
- Viewer-style counter fluctuating around 32K.
- Optional screen sharing, started only when you click **Share screen**.
- Optional OpenAI screen commentary, with a 14-second minimum interval.
- No microphone or camera capture.

## Run on Windows
1. Install Node.js LTS.
2. Download this repository or clone it.
3. Copy `.env.example` to `.env` only if you want AI commentary.
4. Put your API key in the local `.env` file. Never upload `.env` to GitHub or share the key in chat.
5. Open Command Prompt in the project folder and run:

```cmd
npm install
npm start
```

## Build a Windows installer
Run:

```cmd
npm run dist
```

The installer will be created in `dist/`.

## Important
The chatters, badges, and viewer counter are local fictional simulation data. They are not Twitch users, real subscriptions, real moderators, or actual platform viewers. Do not use the display to mislead people about real audience numbers.

Screen sharing is opt-in. When enabled, a downscaled screenshot is sent to the OpenAI API approximately every 14 seconds for commentary. This can use API credits. Keep AI commentary off unless you understand and have permission for any billing. Screenshots are not written to disk by this app, but the selected AI provider processes the images to generate replies.

## Troubleshooting
- If Windows blocks the installer, only run builds you have reviewed and trust.
- If the overlay is hidden behind an exclusive-fullscreen game, use borderless-windowed mode.
- If AI says no key is configured, create a local `.env` file from `.env.example` and restart the app.