const express    = require('express');
const router     = express.Router();
const Project    = require('../models/Project');
const auth       = require('../middleware/auth');
const upload     = require('../middleware/upload');
const cloudinary = require('cloudinary').v2;

router.get('/', async (req, res) => {
  try {
    const items = await Project.find().sort({ order: 1 });
    res.json(items);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', auth, upload.single('image'), async (req, res) => {
  try {
    const count = await Project.countDocuments();
    const tags  = req.body.tags
      ? req.body.tags.split(',').map(t => t.trim()).filter(Boolean)
      : [];
    const image        = req.file ? req.file.path     : '';
    const imagePublicId = req.file ? req.file.filename : '';
    const item = await Project.create({
      ...req.body, tags, image, imagePublicId, order: count + 1
    });
    res.status(201).json(item);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', auth, upload.single('image'), async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Not found' });

    if (req.file) {
      // Delete old image from Cloudinary
      if (project.imagePublicId) {
        try { await cloudinary.uploader.destroy(project.imagePublicId); } catch {}
      }
      project.image         = req.file.path;
      project.imagePublicId = req.file.filename;
    }

    const tags = req.body.tags
      ? req.body.tags.split(',').map(t => t.trim()).filter(Boolean)
      : project.tags;

    Object.assign(project, { ...req.body, tags,
      image: project.image, imagePublicId: project.imagePublicId });
    await project.save();
    res.json(project);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (project?.imagePublicId) {
      try { await cloudinary.uploader.destroy(project.imagePublicId); } catch {}
    }
    await Project.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
