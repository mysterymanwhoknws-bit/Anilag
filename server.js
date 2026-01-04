const express = require('express');
const { spawn } = require('child_process');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/api/scrape', (req, res) => {
    const targetUrl = req.query.url;
    if (!targetUrl) return res.status(400).send("No URL provided");

    // Spawn Python process
    const pythonProcess = spawn('python3', ['scraper.py', targetUrl]);

    let output = "";
    pythonProcess.stdout.on('data', (data) => {
        output += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
        console.error(`Python Error: ${data}`);
    });

    pythonProcess.on('close', (code) => {
        if (code === 0) {
            res.json({ success: true, link: output.trim() });
        } else {
            res.status(500).json({ success: false, error: "Scraper failed" });
        }
    });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
