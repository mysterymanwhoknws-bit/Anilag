const express = require('express');
const { spawn } = require('child_process');
const axios = require('axios'); // Add this to your package.json!
const app = express();
const PORT = process.env.PORT || 3000;

// 1. HOME PAGE - Shows Top Trending Anime from Jikan API
app.get('/', async (req, res) => {
    try {
        const response = await axios.get('https://api.jikan.moe/v4/top/anime?limit=12');
        const animeList = response.data.data;

        let gridHtml = animeList.map(anime => `
            <div style="background:#1a1a1a; border-radius:8px; overflow:hidden;">
                <a href="/watch?url=${encodeURIComponent(anime.url)}" style="text-decoration:none; color:white;">
                    <img src="${anime.images.jpg.large_image_url}" style="width:100%; height:250px; object-fit:cover;">
                    <div style="padding:10px; font-size:14px;">${anime.title}</div>
                </a>
            </div>
        `).join('');

        res.send(`
            <body style="background:#0b0b0b; color:white; font-family:sans-serif; margin:0;">
                <nav style="padding:20px; background:#111; display:flex; justify-content:space-between; align-items:center;">
                    <h2 style="color:#ffdd95; margin:0;">ANILAG</h2>
                    <form action="/search" method="GET">
                        <input name="q" placeholder="Search anime..." style="background:#222; border:none; color:white; padding:10px; border-radius:5px; width:300px;">
                    </form>
                </nav>
                <div style="padding:40px;">
                    <h3>Trending Now</h3>
                    <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap:20px;">
                        ${gridHtml}
                    </div>
                </div>
            </body>
        `);
    } catch (err) {
        res.send("Error loading anime. Jikan API might be rate-limiting. Refresh in 1 second.");
    }
});

// 2. WATCH PAGE (Same as before, using your scraper.py)
app.get('/watch', async (req, res) => {
    const targetUrl = req.query.url;
    res.send(`
        <body style="background:#000; color:white; font-family:sans-serif; margin:0;">
            <div style="padding:20px;"><a href="/" style="color:#ffdd95; text-decoration:none;">← Back</a></div>
            <div style="width:100%; max-width:1000px; margin:auto; aspect-ratio:16/9; background:#111;">
                <iframe id="player" width="100%" height="100%" frameborder="0" allowfullscreen></iframe>
            </div>
            <script>
                fetch('/api/link?url=${encodeURIComponent(targetUrl)}')
                    .then(r => r.text())
                    .then(link => document.getElementById('player').src = link);
            </script>
        </body>
    `);
});

// 3. API FOR SCRAPER
app.get('/api/link', (req, res) => {
    const py = spawn('python3', ['scraper.py', 'video', req.query.url]);
    let output = "";
    py.stdout.on('data', (d) => output += d.toString());
    py.on('close', () => res.send(output.trim()));
});

app.listen(PORT, '0.0.0.0');
