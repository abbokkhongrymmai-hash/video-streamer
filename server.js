import express from 'express';
import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';

// --- Setup for ES Modules ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// ----------------------------

const app = express();
const PORT = process.env.PORT || 3000;

// 1. Serve all static files (index.html, etc.) from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// 2. Serve the player.html page when the user visits /watch
app.get('/watch', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'player.html'));
});

// 3. The core API endpoint that finds the direct stream link
app.get('/api/stream', async (req, res) => {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'No URL provided' });
  }

  try {
    // --- Step 1: Fetch the original Terabox page ---
    const pageResponse = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36'
      }
    });
    const pageData = await pageResponse.text();

    // --- Step 2: Find the 'shorturl' key inside the page's HTML ---
    const match = pageData.match(/shorturl":"(.*?)"/);
    if (!match || !match[1]) {
      throw new Error('Could not find the "shorturl" key on the page.');
    }
    const key = match[1];

    // --- Step 3: Use the key to call the internal Terabox API ---
    const apiUrl = `https://www.terabox.com/api/share/list?app_id=250528&shorturl=${key}&root=1`;

    const apiResponse = await fetch(apiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Accept': 'application/json',
      }
    });
    const apiData = await apiResponse.json();

    // --- Step 4: Extract the direct link and send it to the client ---
    if (apiData.list && apiData.list.length > 0 && apiData.list[0].dlink) {
      const directLink = apiData.list[0].dlink;
      
      // This is the JSON response that player.html is waiting for
      res.json({ direct: directLink });
    } else {
      throw new Error('Could not extract dlink from API response.');
    }

  } catch (error) {
    console.error('Error in /api/stream:', error.message);
    res.status(500).json({ error: 'Failed to get stream link', details: error.message });
  }
});

// Start the server
// Bind to 0.0.0.0 to be accessible in a container environment (like Render)
// Render provides the PORT environment variable automatically.
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server is listening on port ${PORT}`);
});
