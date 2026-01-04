const express = require('express');
const { spawn } = require('child_process');
const path = require('path');
const app = express();

// Render uses the PORT environment variable. Default to 3000 for local testing.
const PORT = process.env.PORT || 3000;

// --- 1. THE HOMEPAGE ROUTE ---
// This fixes the "Cannot GET /" error by serving a simple UI.
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Anilag Scraper</title>
            <style>
                body { background: #0f0f0f; color: #eee; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; }
                .container { background: #1a1a1a; padding: 2rem; border-radius: 12px; box-shadow: 0 8px 24px rgba(0,0,0,0.5); width: 90%; max-width: 500px; text-align: center; }
                h1 { color: #5865F2; margin-bottom: 0.5rem; }
                p { color: #888; margin-bottom: 2rem; }
                input { width: 100%; padding: 12px; margin-bottom: 1rem; border: 1px solid #333; background: #2a2a2a; color: white; border-radius: 6px; box-sizing: border-box; }
                button { background: #5865F2; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer; font-weight: bold; width: 100%; transition: background 0.2s; }
                button:hover { background: #4752c4; }
                .footer { margin-top: 2rem; font-size: 0.8rem; color: #444; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>Anilag Stream</h1>
                <p>Enter an anime page URL to extract the video link.</p>
                <form action="/api/scrape" method="GET">
                    <input type="text" name="url" placeholder="https://hianime.to/watch/..." required>
                    <button type="submit">Extract Video Link</button>
                </form>
            </div>
            <div class="footer">Status: Online and Ready</div>
        </body>
        </html>
    `);
});

// --- 2. THE SCRAPER API ROUTE ---
app.get('/api/scrape', (req, res) => {
    const targetUrl = req.query.url;
    
    if (!targetUrl) {
        return res.status(400).json({ error: "Missing 'url' parameter" });
    }

    // Spawn the Python process
    // Use 'python3' for Linux/Render and '-u' to prevent output buffering
    const pythonProcess = spawn('python3', ['-u', 'scraper.py', targetUrl]);

    let output = "";
    let errorOutput = "";

    pythonProcess.stdout.on('data', (data) => {
        output += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
        errorOutput += data.toString();
    });

    pythonProcess.on('close', (code) => {
        if (code === 0) {
            // Success! Return the scraped link
            res.json({
                success: true,
                target: targetUrl,
                data: output.trim()
            });
        } else {
            console.error(`Scraper failed with code ${code}: ${errorOutput}`);
            res.status(500).json({
                success: false,
                error: "Scraper failed to extract link",
                details: errorOutput
            });
        }
    });
});

// --- 3. START THE SERVER ---
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});
