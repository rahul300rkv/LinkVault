const express = require('express');
const multer = require('multer');
const { nanoid } = require('nanoid');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());

// Initialize SQLite Database 
const db = new sqlite3.Database('./vault.db');

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS vault (
        id TEXT PRIMARY KEY,
        type TEXT,
        content TEXT,
        file_path TEXT,
        file_name TEXT,
        expires_at INTEGER
    )`);
});

// Setup File Storage 
const upload = multer({ dest: 'uploads/' });

// POST: Upload Text or File [cite: 16, 18, 19, 21, 22]
app.post('/api/upload', upload.single('file'), (req, res) => {
    const { text, expiryMinutes } = req.body;
    const id = nanoid(10);
    const duration = expiryMinutes ? parseInt(expiryMinutes) : 10; // Default 10 mins [cite: 32]
    const expiresAt = Date.now() + duration * 60000;

    const type = req.file ? 'file' : 'text';
    const filePath = req.file ? req.file.path : null;
    const fileName = req.file ? req.file.originalname : null;

    const query = `INSERT INTO vault (id, type, content, file_path, file_name, expires_at) VALUES (?, ?, ?, ?, ?, ?)`;
    db.run(query, [id, type, text, filePath, fileName, expiresAt], (err) => {
        if (err) return res.status(500).json({ error: "DB Error" });
        res.json({ url: `http://localhost:5173/v/${id}` });
    });
});

// GET: Retrieve Content [cite: 25, 26, 28, 35, 37, 40]
app.get('/api/content/:id', (req, res) => {
    db.get(`SELECT * FROM vault WHERE id = ?`, [req.params.id], (err, row) => {
        if (!row || Date.now() > row.expires_at) {
            return res.status(403).send("Link invalid or expired."); // [cite: 28, 33]
        }
        res.json(row);
    });
});

// GET: Download File [cite: 41]
app.get('/api/download/:id', (req, res) => {
    db.get(`SELECT * FROM vault WHERE id = ?`, [req.params.id], (err, row) => {
        if (row && row.file_path) res.download(row.file_path, row.file_name);
        else res.status(404).send("File not found.");
    });
});

app.listen(5000, () => console.log('Server running on port 5000'));