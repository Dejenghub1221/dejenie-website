const express    = require('express');
const router     = express.Router();
const { getSupabase } = require('../db-supabase');
const auth       = require('../middleware/auth');
const upload     = require('../middleware/upload');
const cloudinary = require('cloudinary').v2;

router.get('/', async (req, res) => {
  try {
    const { data, error } = await getSupabase()
      .from('gallery').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', auth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const { data, error } = await getSupabase().from('gallery').insert({
      url:             req.file.path,
      image_public_id: req.file.filename,
      caption:         req.body.caption || ''
    }).select().single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const sb = getSupabase();
    const { data: item } = await sb.from('gallery').select('image_public_id').eq('id', req.params.id).single();
    if (item?.image_public_id) try { await cloudinary.uploader.destroy(item.image_public_id); } catch {}
    const { error } = await sb.from('gallery').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
