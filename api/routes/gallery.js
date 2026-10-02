const express    = require('express');
const router     = express.Router();
const { getSupabase } = require('../db-supabase');
const auth       = require('../middleware/auth');
const upload     = require('../middleware/upload');
const local      = require('../db-local');

// GET /api/gallery
router.get('/', async (req, res) => {
  try {
    const { data, error } = await getSupabase()
      .from('gallery').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    console.warn('[gallery] Supabase GET failed, using local db:', err.message);
    res.json(local.getTable('gallery'));
  }
});

// POST /api/gallery  (admin)
router.post('/', auth, upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  const row = {
    url:             req.file.path,
    image_public_id: req.file.filename || '',
    caption:         req.body.caption || '',
  };

  try {
    const { data, error } = await getSupabase()
      .from('gallery').insert(row).select().single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    console.warn('[gallery] Supabase POST failed, saving to local db:', err.message);
    const saved = local.insertRow('gallery', row);
    res.status(201).json(saved);
  }
});

// DELETE /api/gallery/:id  (admin)
router.delete('/:id', auth, async (req, res) => {
  try {
    const sb = getSupabase();
    const { data: item } = await sb.from('gallery')
      .select('image_public_id').eq('id', req.params.id).single();
    if (item?.image_public_id) {
      try {
        const cloudinary = require('cloudinary').v2;
        await cloudinary.uploader.destroy(item.image_public_id);
      } catch {}
    }
    const { error } = await sb.from('gallery').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    console.warn('[gallery] Supabase DELETE failed, removing from local db:', err.message);
    local.deleteRow('gallery', req.params.id);
    res.json({ success: true });
  }
});

module.exports = router;
