const express  = require('express');
const router   = express.Router();
const { getSupabase } = require('../db-supabase');
const auth     = require('../middleware/auth');
const upload   = require('../middleware/upload');
const local    = require('../db-local');

function mapProfile(d) {
  if (!d) return {};
  return {
    ...d,
    cvFile: d.cv_file || d.cvFile,
    stats: {
      experience: d.stat_experience || d.stats?.experience,
      projects:   d.stat_projects   || d.stats?.projects,
      clients:    d.stat_clients    || d.stats?.clients,
    },
  };
}

// GET /api/profile
router.get('/', async (req, res) => {
  try {
    const { data, error } = await getSupabase()
      .from('profile').select('*').eq('id', 1).single();
    if (error) throw error;
    res.json(mapProfile(data));
  } catch (err) {
    console.warn('[profile] Supabase GET failed, using local db:', err.message);
    res.json(mapProfile(local.getProfile()));
  }
});

// PUT /api/profile
router.put('/', auth, async (req, res) => {
  const body = req.body;
  const patch = {
    name: body.name, title: body.title, tagline: body.tagline,
    headline: body.headline, bio: body.bio,
    about1: body.about1, about2: body.about2, about3: body.about3,
    location: body.location, email: body.email, phone: body.phone,
    availability: body.availability,
    linkedin: body.linkedin, github: body.github,
    twitter: body.twitter, telegram: body.telegram,
    stat_experience: body.stats?.experience || body.stat_experience,
    stat_projects:   body.stats?.projects   || body.stat_projects,
    stat_clients:    body.stats?.clients    || body.stat_clients,
    updated_at: new Date().toISOString(),
  };
  Object.keys(patch).forEach(k => patch[k] === undefined && delete patch[k]);

  try {
    const { data, error } = await getSupabase()
      .from('profile').update(patch).eq('id', 1).select().single();
    if (error) throw error;
    res.json(mapProfile(data));
  } catch (err) {
    console.warn('[profile] Supabase PUT failed, using local db:', err.message);
    const updated = local.setProfile(patch);
    res.json(mapProfile(updated));
  }
});

// POST /api/profile/photo
router.post('/photo', auth, upload.single('photo'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  try {
    const { error } = await getSupabase()
      .from('profile').update({ photo: req.file.path }).eq('id', 1);
    if (error) throw error;
    res.json({ photo: req.file.path });
  } catch (err) {
    console.warn('[profile] Supabase photo update failed, using local db:', err.message);
    local.setProfile({ photo: req.file.path });
    res.json({ photo: req.file.path });
  }
});

// POST /api/profile/cv
router.post('/cv', auth, upload.single('cv'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  try {
    const { error } = await getSupabase()
      .from('profile').update({ cv_file: req.file.path }).eq('id', 1);
    if (error) throw error;
    res.json({ cvFile: req.file.path });
  } catch (err) {
    console.warn('[profile] Supabase cv update failed, using local db:', err.message);
    local.setProfile({ cv_file: req.file.path });
    res.json({ cvFile: req.file.path });
  }
});

module.exports = router;
