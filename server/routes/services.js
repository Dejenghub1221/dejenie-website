const express = require('express');
const router  = express.Router();
const Service = require('../models/Service');
const auth    = require('../middleware/auth');

router.get('/', async (req, res) => {
  try { res.json(await Service.find().sort({ order: 1 })); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const count = await Service.countDocuments();
    res.status(201).json(await Service.create({ ...req.body, order: count + 1 }));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const item = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try { await Service.findByIdAndDelete(req.params.id); res.json({ success: true }); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
