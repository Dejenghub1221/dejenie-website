require('dotenv').config();
const express   = require('express');
const cors      = require('cors');
const path      = require('path');
const connectDB = require('./db-mongo');

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Connect MongoDB ──
connectDB();

// ── Middleware ──
app.use(cors({ origin: '*', credentials: false }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── API Routes ──
app.use('/api/auth',           require('./routes/auth'));
app.use('/api/profile',        require('./routes/profile'));
app.use('/api/experience',     require('./routes/experience'));
app.use('/api/skills',         require('./routes/skills'));
app.use('/api/projects',       require('./routes/projects'));
app.use('/api/services',       require('./routes/services'));
app.use('/api/certifications', require('./routes/certifications'));
app.use('/api/gallery',        require('./routes/gallery'));
app.use('/api/messages',       require('./routes/messages'));
app.use('/api/chatbot',        require('./routes/chatbot'));

// ── Health check ──
app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

// ── Serve Admin React build ──
const adminBuild = path.join(__dirname, '../admin/dist');
app.use('/admin', express.static(adminBuild));
app.get('/admin/*', (req, res) => {
  res.sendFile(path.join(adminBuild, 'index.html'));
});

// ── Serve Portfolio (HTML/CSS/JS) ──
const portfolioPath = path.join(__dirname, '..');
app.use(express.static(portfolioPath, {
  index: 'index.html',
  ignore: ['server/**', 'admin/**', 'node_modules/**']
}));

// ── Root: redirect to portfolio ──
app.get('/', (req, res) => {
  res.sendFile(path.join(portfolioPath, 'index.html'));
});

// ── Catch-all: serve portfolio for any unmatched route ──
app.get('*', (req, res) => {
  res.sendFile(path.join(portfolioPath, 'index.html'));
});

// ── Error handler ──
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

// ── Start server (local dev) ──
app.listen(PORT, () => {
  console.log(`\n🚀 Server running at http://localhost:${PORT}`);
  console.log(`📦 API        → http://localhost:${PORT}/api`);
  console.log(`🌐 Portfolio  → http://localhost:${PORT}`);
  console.log(`🔧 Admin      → http://localhost:${PORT}/admin`);
  console.log(`🔑 Login: ${process.env.ADMIN_USERNAME} / ${process.env.ADMIN_PASSWORD}\n`);
});

module.exports = app;
