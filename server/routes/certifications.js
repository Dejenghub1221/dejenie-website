const express       = require('express');
const router        = express.Router();
const Certification = require('../models/Certification');
const auth          = require('../middleware/auth');

router.get('/', async (req, res) => {
  try { res.json(await Certification.find().sort({ order: 1 })); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const count = await Certification.countDocuments();
    res.status(201).json(await Certification.create({ ...req.body, order: count + 1 }));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const item = await Certification.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try { await Certification.findByIdAndDelete(req.params.id); res.json({ success: true }); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
