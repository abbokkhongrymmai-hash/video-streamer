# 🎬 Video Streamer

A simple Node.js web app to generate and play direct streaming links for Terabox videos.

## Features
* **Simple Interface**: Paste a Terabox link and watch.
* **Dynamic API**: The server fetches the direct `.mp4` link from the Terabox API on the fly.
* **No Installs**: Fully web-based; streams directly in the browser.

## How It Works
1.  **`index.html`**: The user pastes a Terabox URL.
2.  **`player.html`**: This page's script calls the local `/api/stream` endpoint.
3.  **`server.js`**: The server scrapes the Terabox page for an API key, then calls the internal Terabox API to get the direct video link (`dlink`).
4.  **`player.html`**: The direct link is returned as JSON and set as the `<video>` source.

## Deployment

This app is ready to deploy on platforms like [Render.com](https://render.com/).

### Render Settings
* **Build Command**: `npm install`
* **Start Command**: `npm start`
