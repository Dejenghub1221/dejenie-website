const express = require('express');
const router  = require('express').Router();
const Chatbot = require('../models/Chatbot');
const Profile = require('../models/Profile');
const Skill   = require('../models/Skill');
const Project = require('../models/Project');
const Service = require('../models/Service');
const Certification = require('../models/Certification');
const auth    = require('../middleware/auth');

// Helper — get or create the single chatbot config document
async function getBot() {
  let bot = await Chatbot.findOne();
  if (!bot) {
    bot = await Chatbot.create({
      botName: 'Dejenie Bot',
      greeting: "Hi there! 👋 I'm Dejenie's assistant. Ask me anything!",
      quickReplies: ['Who are you?','What are your skills?','How can I contact you?','Download CV'],
      faqs: []
    });
  }
  return bot;
}

// GET /api/chatbot/config  (public)
router.get('/config', async (req, res) => {
  try { res.json(await getBot()); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/chatbot/message  (public)
router.post('/message', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message?.trim()) return res.status(400).json({ error: 'Message required' });

    const bot = await getBot();
    const msg = message.toLowerCase().trim();

    // 1. FAQ keyword match
    let bestMatch = null, bestScore = 0;
    for (const faq of bot.faqs || []) {
      const score = (faq.keywords || []).filter(k => msg.includes(k.toLowerCase())).length;
      if (score > bestScore) { bestScore = score; bestMatch = faq; }
    }
    if (bestMatch && bestScore > 0)
      return res.json({ reply: bestMatch.answer, source: 'faq' });

    // 2. Profile dynamic answers
    const profile = await Profile.findOne() || {};

    if (/hello|hi |hey|greet/i.test(msg))
      return res.json({ reply: `Hello! 😊 I'm ${bot.botName}. How can I help you?`, source: 'greeting' });

    if (/name|who are you|yourself/i.test(msg))
      return res.json({ reply: `I'm ${profile.name}. ${profile.bio}`, source: 'profile' });

    if (/skill|tech|expertise/i.test(msg)) {
      const skills = await Skill.find().sort({ order: 1 });
      const list = skills.map(s => `${s.name} (${s.percentage}%)`).join(', ');
      return res.json({ reply: `Top skills: ${list}`, source: 'skills' });
    }

    if (/project|portfolio|work done/i.test(msg)) {
      const projects = await Project.find().sort({ order: 1 });
      const list = projects.map(p => p.title).join(', ');
      return res.json({ reply: `Recent projects: ${list}. Check the Projects section!`, source: 'projects' });
    }

    if (/service|offer|provide/i.test(msg)) {
      const services = await Service.find().sort({ order: 1 });
      const list = services.map(s => s.title).join(', ');
      return res.json({ reply: `Services: ${list}.`, source: 'services' });
    }

    if (/cert|certif/i.test(msg)) {
      const certs = await Certification.find().sort({ order: 1 });
      const list = certs.map(c => `${c.title} (${c.issuer})`).join(', ');
      return res.json({ reply: `Certifications: ${list}.`, source: 'certifications' });
    }

    if (/contact|email|phone|reach/i.test(msg))
      return res.json({ reply: `Email: ${profile.email} | Phone: ${profile.phone}`, source: 'profile' });

    if (/location|where|city|country/i.test(msg))
      return res.json({ reply: `Based in ${profile.location}.`, source: 'profile' });

    if (/available|hire|freelance/i.test(msg))
      return res.json({ reply: `${profile.name} is: ${profile.availability}. Feel free to reach out!`, source: 'profile' });

    if (/cv|resume|download/i.test(msg))
      return res.json({ reply: `Download the CV using the Download CV button at the top of the page!`, source: 'profile' });

    // Fallback
    return res.json({
      reply: `I'm not sure about that. Contact ${profile.name} at ${profile.email} or use the Contact form. 😊`,
      source: 'fallback'
    });

  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/chatbot  (admin)
router.get('/', auth, async (req, res) => {
  try { res.json(await getBot()); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT /api/chatbot  (admin)
router.put('/', auth, async (req, res) => {
  try {
    let bot = await Chatbot.findOne();
    if (!bot) bot = new Chatbot();
    Object.assign(bot, req.body);
    await bot.save();
    res.json(bot);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/chatbot/faqs  (admin)
router.post('/faqs', auth, async (req, res) => {
  try {
    const { keywords, answer } = req.body;
    if (!keywords || !answer) return res.status(400).json({ error: 'keywords and answer required' });
    const bot = await getBot();
    const kws = Array.isArray(keywords) ? keywords : keywords.split(',').map(k => k.trim());
    bot.faqs.push({ keywords: kws, answer });
    await bot.save();
    res.status(201).json(bot.faqs[bot.faqs.length - 1]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT /api/chatbot/faqs/:id  (admin)
router.put('/faqs/:id', auth, async (req, res) => {
  try {
    const bot = await getBot();
    const faq = bot.faqs.id(req.params.id);
    if (!faq) return res.status(404).json({ error: 'FAQ not found' });
    const { keywords, answer } = req.body;
    faq.keywords = Array.isArray(keywords) ? keywords : keywords.split(',').map(k => k.trim());
    faq.answer   = answer;
    await bot.save();
    res.json(faq);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE /api/chatbot/faqs/:id  (admin)
router.delete('/faqs/:id', auth, async (req, res) => {
  try {
    const bot = await getBot();
    bot.faqs.pull({ _id: req.params.id });
    await bot.save();
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
