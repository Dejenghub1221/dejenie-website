const express  = require('express');
const router   = express.Router();
const { getSupabase } = require('../db-supabase');
const auth     = require('../middleware/auth');
const upload   = require('../middleware/upload');

// GET /api/profile  (public)
router.get('/', async (req, res) => {
  try {
    const sb = getSupabase();
    const { data, error } = await sb.from('profile').select('*').eq('id', 1).single();
    if (error) throw error;
    // Map snake_case → camelCase for frontend compatibility
    res.json(mapProfile(data));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT /api/profile  (admin)
router.put('/', auth, async (req, res) => {
  try {
    const sb   = getSupabase();
    const body = req.body;
    const update = {
      name:             body.name,
      title:            body.title,
      tagline:          body.tagline,
      headline:         body.headline,
      bio:              body.bio,
      about1:           body.about1,
      about2:           body.about2,
      about3:           body.about3,
      location:         body.location,
      email:            body.email,
      phone:            body.phone,
      availability:     body.availability,
      linkedin:         body.linkedin,
      github:           body.github,
      twitter:          body.twitter,
      telegram:         body.telegram,
      stat_experience:  body.stats?.experience || body.stat_experience,
      stat_projects:    body.stats?.projects   || body.stat_projects,
      stat_clients:     body.stats?.clients    || body.stat_clients,
      updated_at:       new Date().toISOString()
    };
    // Remove undefined keys
    Object.keys(update).forEach(k => update[k] === undefined && delete update[k]);

    const { data, error } = await sb.from('profile').update(update).eq('id', 1).select().single();
    if (error) throw error;
    res.json(mapProfile(data));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/profile/photo  (admin)
router.post('/photo', auth, upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const sb = getSupabase();
    const { error } = await sb.from('profile').update({ photo: req.file.path }).eq('id', 1);
    if (error) throw error;
    res.json({ photo: req.file.path });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/profile/cv  (admin)
router.post('/cv', auth, upload.single('cv'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const sb = getSupabase();
    const { error } = await sb.from('profile').update({ cv_file: req.file.path }).eq('id', 1);
    if (error) throw error;
    res.json({ cvFile: req.file.path });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Helper: map DB row → frontend shape
function mapProfile(d) {
  if (!d) return {};
  return {
    ...d,
    cvFile: d.cv_file,
    stats: {
      experience: d.stat_experience,
      projects:   d.stat_projects,
      clients:    d.stat_clients
    }
  };
}

module.exports = router;
