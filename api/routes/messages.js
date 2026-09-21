const express  = require('express');
const router   = express.Router();
const { getSupabase } = require('../db-supabase');
const auth     = require('../middleware/auth');

// POST /api/messages  (public — contact form)
router.post('/', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !message)
      return res.status(400).json({ error: 'name, email, and message are required' });
    const { error } = await getSupabase().from('messages')
      .insert({ name, email, subject: subject || '(no subject)', message });
    if (error) throw error;
    res.status(201).json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/messages  (admin)
router.get('/', auth, async (req, res) => {
  try {
    const { data, error } = await getSupabase()
      .from('messages').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PATCH /api/messages/:id/read  (admin)
router.patch('/:id/read', auth, async (req, res) => {
  try {
    const { data, error } = await getSupabase()
      .from('messages').update({ read: true }).eq('id', req.params.id).select().single();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Not found' });
    res.json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE /api/messages/:id  (admin)
router.delete('/:id', auth, async (req, res) => {
  try {
    const { error } = await getSupabase().from('messages').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
