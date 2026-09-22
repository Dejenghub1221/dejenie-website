require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const express   = require('express');
const cors      = require('cors');
const path      = require('path');

const app  = express();
const PORT = process.env.PORT || 5000;

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
app.get('/api/health', (req, res) =>
  res.json({ status: 'ok', time: new Date().toISOString() })
);

// ── Serve Uploads at /uploads ──
const uploadsPath = path.join(__dirname, 'uploads');
app.use('/uploads', express.static(uploadsPath));

// ── Serve Portfolio at /portfolio ──
const portfolioPath = path.join(__dirname, '../portfolio');
app.use('/portfolio', express.static(portfolioPath));
app.get('/portfolio', (req, res) =>
  res.sendFile(path.join(portfolioPath, 'index.html'))
);

// ── Serve Admin React build at /admin ──
const adminBuild = path.join(__dirname, '../admin/dist');
app.use('/admin', express.static(adminBuild));
app.get(['/admin', '/admin/*'], (req, res) =>
  res.sendFile(path.join(adminBuild, 'index.html'))
);

// ── Root "/" — API Server Dashboard ──
app.get('/', (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>Dejenie Portfolio — Server</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Segoe UI',sans-serif;background:#0d1117;color:#e2e8f0;
         min-height:100vh;display:flex;align-items:center;justify-content:center}
    .card{background:#161b22;border:1px solid #30363d;border-radius:16px;
          padding:48px 40px;max-width:540px;width:90%;text-align:center}
    .badge{display:inline-flex;align-items:center;gap:8px;background:#0d2a1f;
           border:1px solid #238636;color:#3fb950;padding:6px 16px;
           border-radius:50px;font-size:.8rem;font-weight:700;margin-bottom:24px}
    .dot{width:8px;height:8px;background:#3fb950;border-radius:50%;
         animation:pulse 1.5s infinite}
    @keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}
    h1{font-size:1.8rem;font-weight:800;margin-bottom:8px;
       background:linear-gradient(135deg,#3b82f6,#6366f1);
       -webkit-background-clip:text;-webkit-text-fill-color:transparent}
    p{color:#8b949e;font-size:.9rem;margin-bottom:36px;line-height:1.7}
    .buttons{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:32px}
    .btn{display:flex;align-items:center;justify-content:center;gap:8px;
         padding:14px 20px;border-radius:10px;font-size:.875rem;font-weight:600;
         text-decoration:none;transition:opacity .2s,transform .2s}
    .btn:hover{opacity:.88;transform:translateY(-2px)}
    .btn-portfolio{background:linear-gradient(135deg,#3b82f6,#6366f1);color:#fff}
    .btn-admin{background:linear-gradient(135deg,#7c3aed,#a855f7);color:#fff}
    .btn-api{background:#161b22;border:1px solid #30363d;color:#8b949e}
    .btn-health{background:#0d2a1f;border:1px solid #238636;color:#3fb950}
    .divider{border:none;border-top:1px solid #21262d;margin:24px 0}
    .endpoints{text-align:left;background:#0d1117;border-radius:8px;padding:16px}
    .endpoints h3{font-size:.72rem;text-transform:uppercase;letter-spacing:1px;
                  color:#484f58;margin-bottom:10px}
    .ep{display:flex;align-items:center;gap:8px;padding:5px 0;
        font-size:.82rem;border-bottom:1px solid #21262d}
    .ep:last-child{border:none}
    .method{font-size:.68rem;font-weight:700;padding:2px 7px;border-radius:4px;
            background:#0c2d6b;color:#3b82f6}
    .ep-path{color:#8b949e;font-family:monospace}
    footer{margin-top:24px;font-size:.72rem;color:#484f58}
  </style>
</head>
<body>
  <div class="card">
    <div class="badge"><span class="dot"></span> API Server Online</div>
    <h1>Dejenie Portfolio</h1>
    <p>Backend API server powering the portfolio website and admin panel.</p>

    <div class="buttons">
      <a href="/portfolio" class="btn btn-portfolio">🌐 Portfolio Site</a>
      <a href="/admin"     class="btn btn-admin">⚙️ Admin Panel</a>
      <a href="/api/health" class="btn btn-health">✓ Health Check</a>
      <a href="/api/profile" class="btn btn-api">{ } Profile API</a>
    </div>

    <hr class="divider"/>

    <div class="endpoints">
      <h3>API Endpoints</h3>
      <div class="ep"><span class="method">GET</span><span class="ep-path">/api/health</span></div>
      <div class="ep"><span class="method">GET</span><span class="ep-path">/api/profile</span></div>
      <div class="ep"><span class="method">GET</span><span class="ep-path">/api/experience</span></div>
      <div class="ep"><span class="method">GET</span><span class="ep-path">/api/skills</span></div>
      <div class="ep"><span class="method">GET</span><span class="ep-path">/api/projects</span></div>
      <div class="ep"><span class="method">GET</span><span class="ep-path">/api/services</span></div>
      <div class="ep"><span class="method">GET</span><span class="ep-path">/api/certifications</span></div>
      <div class="ep"><span class="method">GET</span><span class="ep-path">/api/gallery</span></div>
      <div class="ep"><span class="method">GET</span><span class="ep-path">/api/chatbot/config</span></div>
    </div>

    <footer>Dejenie Abebe Portfolio &mdash; ${new Date().getFullYear()}</footer>
  </div>
</body>
</html>`);
});

// ── Error handler ──
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

// ── Start (local dev only) ──
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`\n🚀  http://localhost:${PORT}`);
    console.log(`🌐  Portfolio → http://localhost:${PORT}/portfolio`);
    console.log(`⚙️   Admin    → http://localhost:${PORT}/admin`);
    console.log(`📦  API      → http://localhost:${PORT}/api`);
    console.log(`🔑  Login: ${process.env.ADMIN_USERNAME} / ${process.env.ADMIN_PASSWORD}\n`);
  });
}

module.exports = app;
