const express    = require('express');
const router     = express.Router();
const { getSupabase } = require('../db-supabase');
const auth       = require('../middleware/auth');
const upload     = require('../middleware/upload');
const cloudinary = require('cloudinary').v2;

router.get('/', async (req, res) => {
  try {
    const { data, error } = await getSupabase()
      .from('projects').select('*').order('order', { ascending: true });
    if (error) throw error;
    res.json(data.map(mapProject));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', auth, upload.single('image'), async (req, res) => {
  try {
    const sb    = getSupabase();
    const { count } = await sb.from('projects').select('*', { count: 'exact', head: true });
    const tags  = parseTags(req.body.tags);
    const row   = {
      title:           req.body.title,
      description:     req.body.description || '',
      tags,
      image:           req.file ? req.file.path     : '',
      image_public_id: req.file ? req.file.filename : '',
      link:            req.body.link || '#',
      order:           (count || 0) + 1
    };
    const { data, error } = await sb.from('projects').insert(row).select().single();
    if (error) throw error;
    res.status(201).json(mapProject(data));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', auth, upload.single('image'), async (req, res) => {
  try {
    const sb = getSupabase();
    const { data: existing } = await sb.from('projects').select('*').eq('id', req.params.id).single();
    if (!existing) return res.status(404).json({ error: 'Not found' });

    let image           = existing.image;
    let image_public_id = existing.image_public_id;

    if (req.file) {
      if (image_public_id) try { await cloudinary.uploader.destroy(image_public_id); } catch {}
      image           = req.file.path;
      image_public_id = req.file.filename;
    }

    const row = {
      title:       req.body.title       || existing.title,
      description: req.body.description || existing.description,
      tags:        parseTags(req.body.tags) || existing.tags,
      link:        req.body.link        || existing.link,
      image, image_public_id
    };

    const { data, error } = await sb.from('projects').update(row).eq('id', req.params.id).select().single();
    if (error) throw error;
    res.json(mapProject(data));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const sb = getSupabase();
    const { data: existing } = await sb.from('projects').select('image_public_id').eq('id', req.params.id).single();
    if (existing?.image_public_id) try { await cloudinary.uploader.destroy(existing.image_public_id); } catch {}
    const { error } = await sb.from('projects').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

function parseTags(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  return raw.split(',').map(t => t.trim()).filter(Boolean);
}

function mapProject(d) {
  return { ...d, imagePublicId: d.image_public_id };
}

module.exports = router;
