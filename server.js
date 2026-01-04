const express = require('express');
const { spawn } = require('child_process');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', async (req, res) => {
    try {
        const response = await axios.get('https://api.jikan.moe/v4/top/anime?limit=12');
        const animeList = response.data.data;
        let grid = animeList.map(a => `
            <div class="card">
                <a href="/watch?url=${encodeURIComponent(a.url)}">
                    <img src="${a.images.jpg.large_image_url}">
                    <p>${a.title}</p>
                </a>
            </div>`).join('');

        res.send(layout('Home', `<div class="grid">${grid}</div>`));
    } catch (e) { res.send("Error loading. Please refresh."); }
});

app.get('/watch', (req, res) => {
    const url = req.query.url;
    res.send(layout('Watching', `
        <div class="player-container">
            <video id="player" playsinline controls></video>
        </div>
        <div class="info">
            <h2>Now Playing</h2>
            <p>Directly scraped from HiAnime source.</p>
        </div>
        <script src="https://cdn.jsdelivr.net/npm/hls.js@latest"></script>
        <script src="https://cdn.plyr.io/3.7.8/plyr.js"></script>
        <link rel="stylesheet" href="https://cdn.plyr.io/3.7.8/plyr.css" />
        <script>
            const video = document.getElementById('player');
            const source = '/api/link?url=${encodeURIComponent(url)}';
            
            fetch(source).then(r => r.text()).then(link => {
                if (Hls.isSupported()) {
                    const hls = new Hls();
                    hls.loadSource(link);
                    hls.attachMedia(video);
                } else {
                    video.src = link;
                }
                const player = new Plyr(video, { quality: { default: 720 } });
            });
        </script>
    `));
});

app.get('/api/link', (req, res) => {
    const py = spawn('python3', ['scraper.py', 'video', req.query.url]);
    let out = "";
    py.stdout.on('data', d => out += d);
    py.on('close', () => res.send(out.trim()));
});

function layout(title, content) {
    return `<html><head><title>${title}</title><style>
        body { background:#0b0b0b; color:white; font-family:sans-serif; margin:0; }
        .grid { display:grid; grid-template-columns:repeat(auto-fill, minmax(180px, 1fr)); gap:20px; padding:40px; }
        .card img { width:100%; height:260px; object-fit:cover; border-radius:8px; }
        .card p { font-size:14px; text-decoration:none; color:white; margin-top:10px; }
        .player-container { width:100%; max-width:1100px; margin:20px auto; background:#000; }
        .info { max-width:1100px; margin:auto; padding:20px; }
        nav { background:#111; padding:20px; display:flex; gap:20px; }
        a { text-decoration:none; }
    </style></head><body><nav><a href="/" style="color:#ffdd95;font-weight:bold;">ANILAG</a></nav>${content}</body></html>`;
}

app.listen(PORT, '0.0.0.0');
