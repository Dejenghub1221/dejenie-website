const express  = require('express');
const router   = express.Router();
const { getSupabase } = require('../db-supabase');
const auth     = require('../middleware/auth');
const local    = require('../db-local');

router.get('/', async (req, res) => {
  try {
    const { data, error } = await getSupabase()
      .from('services').select('*').order('order', { ascending: true });
    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    console.warn('[services] Supabase GET failed, using local db:', err.message);
    res.json(local.getTable('services'));
  }
});

router.post('/', auth, async (req, res) => {
  const row = {
    id: req.body.id || `srv-${Date.now()}`,
    ...req.body,
  };
  try {
    const sb = getSupabase();
    const { count } = await sb.from('services').select('*', { count: 'exact', head: true });
    row.order = row.order ? Number(row.order) : (count || 0) + 1;
    const { data, error } = await sb.from('services').insert(row).select().single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    console.warn('[services] Supabase POST failed, using local db:', err.message);
    const saved = local.insertRow('services', row);
    res.status(201).json(saved);
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { data, error } = await getSupabase()
      .from('services').update(req.body).eq('id', req.params.id).select().single();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Not found' });
    res.json(data);
  } catch (err) {
    console.warn('[services] Supabase PUT failed, using local db:', err.message);
    const updated = local.updateRow('services', req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Not found' });
    res.json(updated);
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const { error } = await getSupabase()
      .from('services').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    console.warn('[services] Supabase DELETE failed, using local db:', err.message);
    local.deleteRow('services', req.params.id);
    res.json({ success: true });
  }
});

module.exports = router;
