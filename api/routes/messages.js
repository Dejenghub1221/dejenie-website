const express  = require('express');
const router   = express.Router();
const { getSupabase } = require('../db-supabase');
const auth     = require('../middleware/auth');
const fs       = require('fs');
const path     = require('path');

const DB_PATH = path.join(__dirname, '../db.json');

function saveToLocalDb(entry) {
  try {
    const db = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
    if (!Array.isArray(db.messages)) db.messages = [];
    db.messages.unshift(entry);
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
  } catch (e) {
    console.error('[messages] local db fallback error:', e.message);
  }
}

// POST /api/messages  (public — contact form)
router.post('/', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !message)
      return res.status(400).json({ error: 'name, email, and message are required' });

    const entry = {
      id: `msg-${Date.now()}`,
      name,
      email,
      subject: subject || '(no subject)',
      message,
      read: false,
      created_at: new Date().toISOString()
    };

    const { error } = await getSupabase().from('messages').insert(entry);
    if (error) {
      // Supabase failed — fall back to local JSON silently
      console.warn('[messages] Supabase insert failed, saving to local db:', error.message);
      saveToLocalDb(entry);
    }
    res.status(201).json({ success: true });
  } catch (err) {
    // Any unexpected error — still save locally and return success to the user
    console.error('[messages] unexpected error:', err.message);
    try {
      const { name, email, subject, message } = req.body;
      saveToLocalDb({
        id: `msg-${Date.now()}`,
        name: name || '',
        email: email || '',
        subject: subject || '(no subject)',
        message: message || '',
        read: false,
        created_at: new Date().toISOString()
      });
      res.status(201).json({ success: true });
    } catch {
      res.status(500).json({ error: err.message });
    }
  }
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
