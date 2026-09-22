const express  = require('express');
const router   = express.Router();
const { getSupabase } = require('../db-supabase');
const auth     = require('../middleware/auth');

// ── helpers ──────────────────────────────────────────────
async function getConfig() {
  const sb = getSupabase();
  let { data, error } = await sb.from('chatbot').select('*').eq('id', 1).single();
  if (error || !data) {
    // create default row
    const res = await sb.from('chatbot').insert({ id: 1 }).select().single();
    data = res.data;
  }
  const { data: faqs } = await sb.from('chatbot_faqs').select('*').order('created_at', { ascending: true });
  return { ...data, faqs: faqs || [] };
}

function mapConfig(row, faqs) {
  return {
    _id:          row.id,
    enabled:      row.enabled,
    botName:      row.bot_name,
    greeting:     row.greeting,
    placeholder:  row.placeholder,
    color:        row.color,
    quickReplies: row.quick_replies || [],
    faqs:         (faqs || []).map(f => ({ _id: f.id, id: f.id, keywords: f.keywords, answer: f.answer }))
  };
}

// GET /api/chatbot/config  (public)
router.get('/config', async (req, res) => {
  try {
    const cfg = await getConfig();
    res.json(mapConfig(cfg, cfg.faqs));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/chatbot/message  (public)
router.post('/message', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message?.trim()) return res.status(400).json({ error: 'Message required' });
    const sb  = getSupabase();
    const msg = message.toLowerCase().trim();
    const cfg = await getConfig();

    // 1. FAQ keyword match
    let best = null, bestScore = 0;
    for (const faq of cfg.faqs) {
      const score = (faq.keywords || []).filter(k => msg.includes(k.toLowerCase())).length;
      if (score > bestScore) { bestScore = score; best = faq; }
    }
    if (best && bestScore > 0) return res.json({ reply: best.answer, source: 'faq' });

    // 2. Profile-based answers
    const { data: p } = await sb.from('profile').select('*').eq('id', 1).single();

    if (/hello|hi |hey/i.test(msg))
      return res.json({ reply: `Hello! 😊 I'm ${cfg.bot_name || cfg.botName || 'Dejenie Bot'}. How can I help?`, source: 'greeting' });
    if (/who|name|yourself/i.test(msg))
      return res.json({ reply: `I'm ${p?.name || 'Dejenie Abebe'}. ${p?.bio || ''}`, source: 'profile' });
    if (/skill|tech|expertise/i.test(msg)) {
      const { data: skills } = await sb.from('skills').select('name,percentage').order('order');
      return res.json({ reply: `Top skills: ${(skills || []).map(s => `${s.name} (${s.percentage}%)`).join(', ')}`, source: 'skills' });
    }
    if (/project|portfolio/i.test(msg)) {
      const { data: projects } = await sb.from('projects').select('title').order('order');
      return res.json({ reply: `Recent projects: ${(projects || []).map(p => p.title).join(', ')}`, source: 'projects' });
    }
    if (/service|offer/i.test(msg)) {
      const { data: services } = await sb.from('services').select('title').order('order');
      return res.json({ reply: `Services: ${(services || []).map(s => s.title).join(', ')}`, source: 'services' });
    }
    if (/cert/i.test(msg)) {
      const { data: certs } = await sb.from('certifications').select('title,issuer').order('order');
      return res.json({ reply: `Certifications: ${(certs || []).map(c => `${c.title} (${c.issuer})`).join(', ')}`, source: 'certifications' });
    }
    if (/contact|email|phone/i.test(msg))
      return res.json({ reply: `Email: ${p?.email} | Phone: ${p?.phone}`, source: 'profile' });
    if (/location|where|city/i.test(msg))
      return res.json({ reply: `Based in ${p?.location}`, source: 'profile' });
    if (/cv|resume|download/i.test(msg))
      return res.json({ reply: `Use the Download CV button at the top of the page!`, source: 'profile' });

    return res.json({ reply: `Not sure about that. Contact ${p?.name} at ${p?.email} or use the Contact form. 😊`, source: 'fallback' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/chatbot  (admin)
router.get('/', auth, async (req, res) => {
  try {
    const cfg = await getConfig();
    res.json(mapConfig(cfg, cfg.faqs));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT /api/chatbot  (admin)
router.put('/', auth, async (req, res) => {
  try {
    const sb = getSupabase();
    const update = {
      enabled:      req.body.enabled,
      bot_name:     req.body.botName,
      greeting:     req.body.greeting,
      placeholder:  req.body.placeholder,
      color:        req.body.color,
      quick_replies: Array.isArray(req.body.quickReplies) ? req.body.quickReplies : [],
      updated_at:   new Date().toISOString()
    };
    Object.keys(update).forEach(k => update[k] === undefined && delete update[k]);
    const { error } = await sb.from('chatbot').update(update).eq('id', 1);
    if (error) throw error;
    const cfg = await getConfig();
    res.json(mapConfig(cfg, cfg.faqs));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/chatbot/faqs  (admin)
router.post('/faqs', auth, async (req, res) => {
  try {
    const { keywords, answer } = req.body;
    if (!keywords || !answer) return res.status(400).json({ error: 'keywords and answer required' });
    const kws = Array.isArray(keywords) ? keywords : keywords.split(',').map(k => k.trim());
    const { data, error } = await getSupabase().from('chatbot_faqs').insert({ keywords: kws, answer }).select().single();
    if (error) throw error;
    res.status(201).json({ ...data, id: data.id, _id: data.id });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT /api/chatbot/faqs/:id  (admin)
router.put('/faqs/:id', auth, async (req, res) => {
  try {
    const { keywords, answer } = req.body;
    const kws = Array.isArray(keywords) ? keywords : keywords.split(',').map(k => k.trim());
    const { data, error } = await getSupabase()
      .from('chatbot_faqs').update({ keywords: kws, answer }).eq('id', req.params.id).select().single();
    if (error) throw error;
    res.json({ ...data, id: data.id, _id: data.id });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE /api/chatbot/faqs/:id  (admin)
router.delete('/faqs/:id', auth, async (req, res) => {
  try {
    const { error } = await getSupabase().from('chatbot_faqs').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
