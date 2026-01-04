const express = require('express');
const { spawn } = require('child_process');
const app = express();
const PORT = process.env.PORT || 3000;

// Helper to run Python Scraper
const callPython = (mode, url) => {
    return new Promise((resolve) => {
        const py = spawn('python3', ['scraper.py', mode, url]);
        let data = "";
        py.stdout.on('data', (chunk) => data += chunk.toString());
        py.on('close', () => resolve(data.trim()));
    });
};

app.get('/', (req, res) => {
    res.send(`<body style="background:#0b0b0b;color:white;font-family:sans-serif;text-align:center;padding:50px;">
        <h1 style="color:#ffdd95;">ANILAG STREAM</h1>
        <form action="/watch" method="GET">
            <input name="url" placeholder="Paste HiAnime URL" style="padding:10px;width:300px;">
            <button type="submit" style="padding:10px;background:#ffdd95;border:none;">Watch</button>
        </form>
    </body>`);
});

app.get('/watch', async (req, res) => {
    const url = req.query.url;
    const episodesJson = await callPython('episodes', url);
    const episodes = JSON.parse(episodesJson || "[]");

    res.send(`
    <body style="background:#000;color:white;font-family:sans-serif;margin:0;display:flex;">
        <div style="flex:3;display:flex;flex-direction:column;">
            <div style="width:100%;aspect-ratio:16/9;background:#111;">
                <iframe id="v-player" width="100%" height="100%" frameborder="0" allowfullscreen></iframe>
            </div>
            <div style="padding:20px;">
                <h2 style="color:#ffdd95;">Now Playing</h2>
                <p>Enjoy your ad-free stream.</p>
            </div>
        </div>
        <div style="flex:1;background:#111;padding:20px;height:100vh;overflow-y:auto;border-left:1px solid #333;">
            <h3>Episodes</h3>
            <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:5px;">
                ${episodes.map(ep => `<button onclick="play('${url}')" style="padding:10px;background:#222;color:white;border:none;cursor:pointer;">${ep.number}</button>`).join('')}
            </div>
        </div>
        <script>
            function play(link) {
                fetch('/api/link?url=' + encodeURIComponent(link))
                    .then(r => r.text())
                    .then(src => document.getElementById('v-player').src = src);
            }
            if(${episodes.length} > 0) play('${url}');
        </script>
    </body>`);
});

app.get('/api/link', async (req, res) => {
    const link = await callPython('video', req.query.url);
    res.send(link);
});

app.listen(PORT, '0.0.0.0');
