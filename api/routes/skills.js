const express  = require('express');
const router   = express.Router();
const { getSupabase } = require('../db-supabase');
const auth     = require('../middleware/auth');
const local    = require('../db-local');

router.get('/', async (req, res) => {
  try {
    const { data, error } = await getSupabase()
      .from('skills').select('*').order('order', { ascending: true });
    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    console.warn('[skills] Supabase GET failed, using local db:', err.message);
    res.json(local.getTable('skills'));
  }
});

router.post('/', auth, async (req, res) => {
  const row = {
    id:         req.body.id || `sk-${Date.now()}`,
    name:       req.body.name || '',
    percentage: Number(req.body.percentage) || 0,
    category:   req.body.category || 'General',
  };
  try {
    const sb = getSupabase();
    const { count } = await sb.from('skills').select('*', { count: 'exact', head: true });
    row.order = Number(count || 0) + 1;
    const { data, error } = await sb.from('skills').insert(row).select().single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    console.warn('[skills] Supabase POST failed, using local db:', err.message);
    const saved = local.insertRow('skills', row);
    res.status(201).json(saved);
  }
});

router.put('/:id', auth, async (req, res) => {
  const patch = {};
  if (req.body.name       !== undefined) patch.name       = req.body.name;
  if (req.body.percentage !== undefined) patch.percentage = Number(req.body.percentage);
  if (req.body.category   !== undefined) patch.category   = req.body.category;
  if (req.body.order      !== undefined) patch.order      = Number(req.body.order);
  try {
    const { data, error } = await getSupabase()
      .from('skills').update(patch).eq('id', req.params.id).select().single();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Not found' });
    res.json(data);
  } catch (err) {
    console.warn('[skills] Supabase PUT failed, using local db:', err.message);
    const updated = local.updateRow('skills', req.params.id, patch);
    if (!updated) return res.status(404).json({ error: 'Not found' });
    res.json(updated);
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const { error } = await getSupabase()
      .from('skills').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    console.warn('[skills] Supabase DELETE failed, using local db:', err.message);
    local.deleteRow('skills', req.params.id);
    res.json({ success: true });
  }
});

module.exports = router;
