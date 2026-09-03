const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Runs behind Railway's edge / a forwarding proxy
app.set('trust proxy', true);
app.disable('x-powered-by');

app.get('/health', (req, res) => {
  res.json({ service: 'detasawy-frontend', status: 'ok', uptime: process.uptime() });
});

app.use(express.static(path.join(__dirname, 'public'), { index: false }));

// Every path serves the under-construction page; no-store so proxies
// and browsers drop it the moment the real site goes live
app.use((req, res) => {
  res.set('Cache-Control', 'no-store');
  res.status(200).sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`detasawy-frontend listening on port ${PORT}`);
});
