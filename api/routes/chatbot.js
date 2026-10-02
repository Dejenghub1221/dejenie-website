const express  = require('express');
const router   = express.Router();
const { getSupabase } = require('../db-supabase');
const auth     = require('../middleware/auth');
const local    = require('../db-local');

/* ── helpers ──────────────────────────────────────────── */
async function getConfig() {
  try {
    const sb = getSupabase();
    let { data, error } = await sb.from('chatbot').select('*').eq('id', 1).single();
    if (error) throw error;
    if (!data) {
      const res = await sb.from('chatbot').insert({ id: 1 }).select().single();
      data = res.data;
    }
    const { data: faqs } = await sb.from('chatbot_faqs').select('*').order('created_at', { ascending: true });
    return { ...data, faqs: faqs || [] };
  } catch (err) {
    console.warn('[chatbot] Supabase getConfig failed, using local db:', err.message);
    const db   = local.read();
    const cb   = db.chatbot || {};
    return {
      id: 1,
      enabled:       cb.enabled      !== undefined ? cb.enabled : true,
      bot_name:      cb.bot_name     || cb.botName      || 'Dejenie Bot',
      greeting:      cb.greeting     || "Hi there! 👋 I'm Dejenie's assistant!",
      placeholder:   cb.placeholder  || 'Type a message...',
      color:         cb.color        || '#3b82f6',
      quick_replies: cb.quick_replies || cb.quickReplies || [],
      faqs:          Array.isArray(cb.faqs) ? cb.faqs : [],
    };
  }
}

function mapConfig(row) {
  return {
    _id:          row.id,
    enabled:      row.enabled,
    botName:      row.bot_name || row.botName,
    greeting:     row.greeting,
    placeholder:  row.placeholder,
    color:        row.color,
    quickReplies: row.quick_replies || row.quickReplies || [],
    faqs: (row.faqs || []).map(f => ({
      _id: f.id, id: f.id,
      keywords: f.keywords,
      answer:   f.answer,
    })),
  };
}

async function getProfileData() {
  try {
    const { data } = await getSupabase().from('profile').select('*').eq('id', 1).single();
    return data || local.getProfile();
  } catch {
    return local.getProfile();
  }
}

/* ── GET /api/chatbot/config (public) ── */
router.get('/config', async (req, res) => {
  try {
    const cfg = await getConfig();
    res.json(mapConfig(cfg));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ── POST /api/chatbot/message (public) ── */
router.post('/message', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message?.trim()) return res.status(400).json({ error: 'Message required' });

    const msg = message.toLowerCase().trim();
    const cfg = await getConfig();

    // 1. FAQ keyword match
    let best = null, bestScore = 0;
    for (const faq of (cfg.faqs || [])) {
      const score = (faq.keywords || []).filter(k => msg.includes(k.toLowerCase())).length;
      if (score > bestScore) { bestScore = score; best = faq; }
    }
    if (best && bestScore > 0) return res.json({ reply: best.answer, source: 'faq' });

    // 2. Profile-based answers — fall back to local db gracefully
    const p = await getProfileData();

    async function getList(table) {
      try {
        const { data } = await getSupabase().from(table).select('*').order('order');
        return data || local.getTable(table);
      } catch {
        return local.getTable(table);
      }
    }

    const botName = cfg.bot_name || cfg.botName || 'Dejenie Bot';

    if (/hello|hi |hey/i.test(msg))
      return res.json({ reply: `Hello! 😊 I'm ${botName}. How can I help?`, source: 'greeting' });
    if (/who|name|yourself/i.test(msg))
      return res.json({ reply: `I'm ${p?.name || 'Dejenie Abebe'}. ${p?.bio || ''}`, source: 'profile' });
    if (/skill|tech|expertise/i.test(msg)) {
      const skills = await getList('skills');
      return res.json({ reply: `Top skills: ${skills.map(s => `${s.name} (${s.percentage}%)`).join(', ')}`, source: 'skills' });
    }
    if (/project|portfolio/i.test(msg)) {
      const projects = await getList('projects');
      return res.json({ reply: `Recent projects: ${projects.map(p => p.title).join(', ')}`, source: 'projects' });
    }
    if (/service|offer/i.test(msg)) {
      const services = await getList('services');
      return res.json({ reply: `Services: ${services.map(s => s.title).join(', ')}`, source: 'services' });
    }
    if (/cert/i.test(msg)) {
      const certs = await getList('certifications');
      return res.json({ reply: `Certifications: ${certs.map(c => `${c.title} (${c.issuer})`).join(', ')}`, source: 'certifications' });
    }
    if (/contact|email|phone/i.test(msg))
      return res.json({ reply: `Email: ${p?.email} | Phone: ${p?.phone}`, source: 'profile' });
    if (/location|where|city/i.test(msg))
      return res.json({ reply: `Based in ${p?.location}`, source: 'profile' });
    if (/cv|resume|download/i.test(msg))
      return res.json({ reply: `Use the Download CV button at the top of the page!`, source: 'profile' });

    return res.json({ reply: `Not sure about that. Contact ${p?.name || 'Dejenie'} at ${p?.email || 'the contact form'}. 😊`, source: 'fallback' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ── GET /api/chatbot (admin) ── */
router.get('/', auth, async (req, res) => {
  try {
    const cfg = await getConfig();
    res.json(mapConfig(cfg));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ── PUT /api/chatbot (admin) ── */
router.put('/', auth, async (req, res) => {
  const update = {
    enabled:       req.body.enabled,
    bot_name:      req.body.botName,
    greeting:      req.body.greeting,
    placeholder:   req.body.placeholder,
    color:         req.body.color,
    quick_replies: Array.isArray(req.body.quickReplies) ? req.body.quickReplies : [],
    updated_at:    new Date().toISOString(),
  };
  Object.keys(update).forEach(k => update[k] === undefined && delete update[k]);

  try {
    const { error } = await getSupabase().from('chatbot').update(update).eq('id', 1);
    if (error) throw error;
    const cfg = await getConfig();
    res.json(mapConfig(cfg));
  } catch (err) {
    console.warn('[chatbot] Supabase PUT failed, using local db:', err.message);
    const db = local.read();
    if (!db.chatbot) db.chatbot = {};
    Object.assign(db.chatbot, {
      enabled:       update.enabled,
      bot_name:      update.bot_name,
      botName:       update.bot_name,
      greeting:      update.greeting,
      placeholder:   update.placeholder,
      color:         update.color,
      quick_replies: update.quick_replies,
      quickReplies:  update.quick_replies,
    });
    local.write(db);
    const cfg = await getConfig();
    res.json(mapConfig(cfg));
  }
});

/* ── POST /api/chatbot/faqs (admin) ── */
router.post('/faqs', auth, async (req, res) => {
  const { keywords, answer } = req.body;
  if (!keywords || !answer) return res.status(400).json({ error: 'keywords and answer required' });
  const kws = Array.isArray(keywords) ? keywords : keywords.split(',').map(k => k.trim());

  try {
    const { data, error } = await getSupabase()
      .from('chatbot_faqs').insert({ keywords: kws, answer }).select().single();
    if (error) throw error;
    res.status(201).json({ ...data, id: data.id, _id: data.id });
  } catch (err) {
    console.warn('[chatbot/faqs] Supabase POST failed, using local db:', err.message);
    const db = local.read();
    if (!db.chatbot) db.chatbot = {};
    if (!Array.isArray(db.chatbot.faqs)) db.chatbot.faqs = [];
    const faq = { id: `faq-${Date.now()}`, keywords: kws, answer, created_at: new Date().toISOString() };
    db.chatbot.faqs.push(faq);
    local.write(db);
    res.status(201).json({ ...faq, _id: faq.id });
  }
});

/* ── PUT /api/chatbot/faqs/:id (admin) ── */
router.put('/faqs/:id', auth, async (req, res) => {
  const { keywords, answer } = req.body;
  const kws = Array.isArray(keywords) ? keywords : keywords.split(',').map(k => k.trim());

  try {
    const { data, error } = await getSupabase()
      .from('chatbot_faqs').update({ keywords: kws, answer }).eq('id', req.params.id).select().single();
    if (error) throw error;
    res.json({ ...data, id: data.id, _id: data.id });
  } catch (err) {
    console.warn('[chatbot/faqs] Supabase PUT failed, using local db:', err.message);
    const db = local.read();
    if (!Array.isArray(db.chatbot?.faqs)) return res.status(404).json({ error: 'Not found' });
    const idx = db.chatbot.faqs.findIndex(f => String(f.id) === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Not found' });
    db.chatbot.faqs[idx] = { ...db.chatbot.faqs[idx], keywords: kws, answer };
    local.write(db);
    res.json({ ...db.chatbot.faqs[idx], _id: db.chatbot.faqs[idx].id });
  }
});

/* ── DELETE /api/chatbot/faqs/:id (admin) ── */
router.delete('/faqs/:id', auth, async (req, res) => {
  try {
    const { error } = await getSupabase().from('chatbot_faqs').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    console.warn('[chatbot/faqs] Supabase DELETE failed, using local db:', err.message);
    const db = local.read();
    if (Array.isArray(db.chatbot?.faqs)) {
      db.chatbot.faqs = db.chatbot.faqs.filter(f => String(f.id) !== req.params.id);
      local.write(db);
    }
    res.json({ success: true });
  }
});

module.exports = router;
