const express    = require('express');
const router     = express.Router();
const Gallery    = require('../models/Gallery');
const auth       = require('../middleware/auth');
const upload     = require('../middleware/upload');
const cloudinary = require('cloudinary').v2;

router.get('/', async (req, res) => {
  try { res.json(await Gallery.find().sort({ createdAt: -1 })); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', auth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const item = await Gallery.create({
      url:           req.file.path,
      imagePublicId: req.file.filename,
      caption:       req.body.caption || ''
    });
    res.status(201).json(item);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const item = await Gallery.findById(req.params.id);
    if (item?.imagePublicId) {
      try { await cloudinary.uploader.destroy(item.imagePublicId); } catch {}
    }
    await Gallery.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
