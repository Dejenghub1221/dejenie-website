const express  = require('express');
const router   = express.Router();
const { getSupabase } = require('../db-supabase');
const auth     = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const { data, error } = await getSupabase()
      .from('services').select('*').order('order', { ascending: true });
    if (error) throw error;
    res.json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const sb = getSupabase();
    const { count } = await sb.from('services').select('*', { count: 'exact', head: true });
    const { data, error } = await sb.from('services')
      .insert({ ...req.body, order: (count || 0) + 1 }).select().single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { data, error } = await getSupabase()
      .from('services').update(req.body).eq('id', req.params.id).select().single();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Not found' });
    res.json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const { error } = await getSupabase().from('services').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
