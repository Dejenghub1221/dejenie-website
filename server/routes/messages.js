const express = require('express');
const router  = express.Router();
const Message = require('../models/Message');
const auth    = require('../middleware/auth');

// POST /api/messages  (public — contact form)
router.post('/', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !message)
      return res.status(400).json({ error: 'name, email, and message are required' });
    await Message.create({ name, email, subject: subject || '(no subject)', message });
    res.status(201).json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/messages  (admin)
router.get('/', auth, async (req, res) => {
  try { res.json(await Message.find().sort({ createdAt: -1 })); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

// PATCH /api/messages/:id/read  (admin)
router.patch('/:id/read', auth, async (req, res) => {
  try {
    const item = await Message.findByIdAndUpdate(req.params.id, { read: true }, { new: true });
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE /api/messages/:id  (admin)
router.delete('/:id', auth, async (req, res) => {
  try {
    await Message.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
