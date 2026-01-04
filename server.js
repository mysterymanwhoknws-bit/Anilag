const express = require('express');
const { spawn } = require('child_process');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('public')); // For images/css if you add them

// --- 1. HOME PAGE (The Grid View) ---
app.get('/', (req, res) => {
    res.send(`
        <body style="background:#0b0b0b; color:white; font-family:sans-serif; margin:0; padding:20px;">
            <header style="padding:20px; border-bottom:1px solid #222; display:flex; justify-content:space-between; align-items:center;">
                <h1 style="color:#ffdd95; margin:0;">Anilag.to</h1>
                <input placeholder="Search anime..." style="background:#222; border:none; color:white; padding:10px; border-radius:20px; width:300px;">
            </header>
            
            <h2 style="margin-top:30px;">Trending Now</h2>
            <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap:20px; padding:20px 0;">
                ${renderCard("One Piece", "https://hianime.to/watch/one-piece-100", "https://cdn.noitatnemucod.net/thumbnail/300x400/100/bcd84737a3de13946efb72e92c64b598.jpg")}
                ${renderCard("Naruto", "https://hianime.to/watch/naruto-677", "https://cdn.noitatnemucod.net/thumbnail/300x400/100/1d624a682bc3394c8b3d6b0559f515e2.jpg")}
            </div>
        </body>
    `);
});

function renderCard(title, url, img) {
    return `
        <div style="background:#1a1a1a; border-radius:8px; overflow:hidden; transition: 0.3s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
            <a href="/watch?url=${encodeURIComponent(url)}" style="text-decoration:none; color:white;">
                <img src="${img}" style="width:100%; height:250px; object-fit:cover;">
                <div style="padding:10px; font-weight:bold;">${title}</div>
            </a>
        </div>
    `;
}

// --- 2. THE WATCH PAGE (The Player) ---
app.get('/watch', (req, res) => {
    const target = req.query.url;
    res.send(`
        <body style="background:#000; color:white; font-family:sans-serif; margin:0; text-align:center;">
            <div style="padding:20px; background:#111;">
                <a href="/" style="color:#ffdd95; text-decoration:none;">← Back to Home</a>
            </div>
            
            <div id="player-status" style="padding:50px; font-size:20px;">
                <div class="spinner"></div> 
                <p>Scraping secure servers for: <b>${target}</b></p>
                <small style="color:#666;">This may take 10-15 seconds...</small>
            </div>

            <div id="video-container" style="display:none; width:90%; max-width:1000px; margin:20px auto; aspect-ratio:16/9; background:#000;">
                <iframe id="video-frame" width="100%" height="100%" frameborder="0" allowfullscreen></iframe>
            </div>

            <script>
                fetch('/api/scrape?url=${encodeURIComponent(target)}')
                    .then(res => res.json())
                    .then(data => {
                        if(data.success) {
                            document.getElementById('player-status').style.display = 'none';
                            document.getElementById('video-container').style.display = 'block';
                            document.getElementById('video-frame').src = data.data;
                        } else {
                            document.getElementById('player-status').innerHTML = "Failed to load video.";
                        }
                    });
            </script>
        </body>
    `);
});

// --- 3. THE SCRAPER API (Remains the same as previous) ---
app.get('/api/scrape', (req, res) => {
    const pythonProcess = spawn('python3', ['-u', 'scraper.py', req.query.url]);
    let output = "";
    pythonProcess.stdout.on('data', (data) => output += data.toString());
    pythonProcess.on('close', () => res.json({ success: true, data: output.trim() }));
});

app.listen(PORT, '0.0.0.0');
