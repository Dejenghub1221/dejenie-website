const express  = require('express');
const router   = express.Router();
const Profile  = require('../models/Profile');
const auth     = require('../middleware/auth');
const upload   = require('../middleware/upload');

// helper — get or create the single profile document
async function getProfile() {
  let profile = await Profile.findOne();
  if (!profile) profile = await Profile.create({});
  return profile;
}

// GET /api/profile  (public)
router.get('/', async (req, res) => {
  try {
    const profile = await getProfile();
    res.json(profile);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT /api/profile  (admin)
router.put('/', auth, async (req, res) => {
  try {
    let profile = await Profile.findOne();
    if (!profile) profile = new Profile();
    Object.assign(profile, req.body);
    await profile.save();
    res.json(profile);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/profile/photo  (admin)
router.post('/photo', auth, upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const photoUrl = req.file.path;           // Cloudinary URL
    const publicId = req.file.filename;       // Cloudinary public_id
    let profile = await Profile.findOne();
    if (!profile) profile = new Profile();
    profile.photo = photoUrl;
    await profile.save();
    res.json({ photo: photoUrl });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/profile/cv  (admin)
router.post('/cv', auth, upload.single('cv'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const cvUrl = req.file.path;
    let profile = await Profile.findOne();
    if (!profile) profile = new Profile();
    profile.cvFile = cvUrl;
    await profile.save();
    res.json({ cvFile: cvUrl });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
