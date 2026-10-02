const express    = require('express');
const router     = express.Router();
const { getSupabase } = require('../db-supabase');
const auth       = require('../middleware/auth');
const upload     = require('../middleware/upload');
const local      = require('../db-local');

function parseTags(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  try { const p = JSON.parse(raw); if (Array.isArray(p)) return p; } catch {}
  return String(raw).split(',').map(t => t.trim()).filter(Boolean);
}

router.get('/', async (req, res) => {
  try {
    const { data, error } = await getSupabase()
      .from('projects').select('*').order('order', { ascending: true });
    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    console.warn('[projects] Supabase GET failed, using local db:', err.message);
    res.json(local.getTable('projects'));
  }
});

router.post('/', auth, upload.single('image'), async (req, res) => {
  const row = {
    id:          req.body.id || `proj-${Date.now()}`,
    title:       req.body.title || '',
    description: req.body.description || '',
    tags:        parseTags(req.body.tags),
    image:       req.file ? req.file.path : (req.body.image || ''),
    link:        req.body.link || '#',
  };
  try {
    const sb = getSupabase();
    const { count } = await sb.from('projects').select('*', { count: 'exact', head: true });
    row.order = Number(count || 0) + 1;
    const { data, error } = await sb.from('projects').insert(row).select().single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    console.warn('[projects] Supabase POST failed, using local db:', err.message);
    const saved = local.insertRow('projects', row);
    res.status(201).json(saved);
  }
});

router.put('/:id', auth, upload.single('image'), async (req, res) => {
  const existing = local.getTable('projects').find(p => String(p.id) === req.params.id) || {};
  const patch = {
    title:       req.body.title       ?? existing.title,
    description: req.body.description ?? existing.description,
    tags:        req.body.tags        ? parseTags(req.body.tags) : existing.tags,
    link:        req.body.link        ?? existing.link,
    image:       req.file ? req.file.path : (existing.image || ''),
  };
  try {
    const { data, error } = await getSupabase()
      .from('projects').update(patch).eq('id', req.params.id).select().single();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Not found' });
    res.json(data);
  } catch (err) {
    console.warn('[projects] Supabase PUT failed, using local db:', err.message);
    const updated = local.updateRow('projects', req.params.id, patch);
    if (!updated) return res.status(404).json({ error: 'Not found' });
    res.json(updated);
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const { error } = await getSupabase()
      .from('projects').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    console.warn('[projects] Supabase DELETE failed, using local db:', err.message);
    local.deleteRow('projects', req.params.id);
    res.json({ success: true });
  }
});

module.exports = router;
