const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'db.json');

// Helper to read db.json safely
function readLocalDb() {
  try {
    if (!fs.existsSync(DB_PATH)) {
      return {
        profile: {},
        experience: [],
        skills: [],
        projects: [],
        services: [],
        certifications: [],
        gallery: [],
        messages: [],
        chatbot: { enabled: true, botName: 'Dejenie Bot', faqs: [] }
      };
    }
    return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
  } catch (err) {
    console.error('[db.json] Error reading local db:', err.message);
    return {};
  }
}

// Helper to write db.json safely
function writeLocalDb(data) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('[db.json] Error saving local db:', err.message);
  }
}

// Check if valid, non-placeholder Supabase credentials exist
function isSupabaseConfigured() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return false;
  if (url.includes('your-project-id') || key.includes('your-service-role-key')) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

// ── Local JSON Query Builder ──
// Mimics Supabase query chaining: from(table).select().order().eq().single().insert().update().delete().upsert()
class LocalQueryBuilder {
  constructor(table) {
    this.table = table;
    this.filters = [];
    this.sortField = null;
    this.sortAscending = true;
    this.isSingle = false;
    this.fields = '*';
    this.countOptions = null;
    this.operation = 'select'; // 'select' | 'insert' | 'update' | 'delete' | 'upsert'
    this.payload = null;
  }

  select(fields = '*', options = null) {
    this.fields = fields;
    this.countOptions = options;
    return this;
  }

  order(field, { ascending = true } = {}) {
    this.sortField = field;
    this.sortAscending = ascending;
    return this;
  }

  eq(field, value) {
    this.filters.push((item) => {
      if (!item) return false;
      return String(item[field]) === String(value);
    });
    return this;
  }

  neq(field, value) {
    this.filters.push((item) => {
      if (!item) return false;
      return String(item[field]) !== String(value);
    });
    return this;
  }

  single() {
    this.isSingle = true;
    return this;
  }

  insert(data) {
    this.operation = 'insert';
    this.payload = data;
    return this;
  }

  update(data) {
    this.operation = 'update';
    this.payload = data;
    return this;
  }

  delete() {
    this.operation = 'delete';
    return this;
  }

  upsert(data) {
    this.operation = 'upsert';
    this.payload = data;
    return this;
  }

  // Make query builder thenable so `await sb.from(...)...` works
  async then(resolve, reject) {
    try {
      const res = this.execute();
      resolve(res);
    } catch (err) {
      reject(err);
    }
  }

  execute() {
    const db = readLocalDb();
    const table = this.table;

    // Handle profile table
    if (table === 'profile') {
      return this.handleProfile(db);
    }

    // Handle chatbot table
    if (table === 'chatbot') {
      return this.handleChatbot(db);
    }

    // Handle chatbot_faqs table
    if (table === 'chatbot_faqs') {
      return this.handleChatbotFaqs(db);
    }

    // Handle array tables: experience, skills, projects, services, certifications, gallery, messages
    if (!Array.isArray(db[table])) {
      db[table] = [];
    }
    const items = db[table];

    if (this.operation === 'insert') {
      const rows = Array.isArray(this.payload) ? this.payload : [this.payload];
      const inserted = rows.map(r => {
        const item = {
          id: r.id || `${table.slice(0, 3)}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          ...r,
          created_at: r.created_at || new Date().toISOString()
        };
        items.push(item);
        return item;
      });
      writeLocalDb(db);
      return {
        data: this.isSingle ? inserted[0] : (Array.isArray(this.payload) ? inserted : inserted[0]),
        error: null
      };
    }

    if (this.operation === 'update') {
      let updatedItem = null;
      db[table] = items.map(item => {
        const matches = this.filters.every(fn => fn(item));
        if (matches) {
          updatedItem = { ...item, ...this.payload };
          return updatedItem;
        }
        return item;
      });
      writeLocalDb(db);
      return {
        data: this.isSingle ? updatedItem : [updatedItem].filter(Boolean),
        error: null
      };
    }

    if (this.operation === 'delete') {
      db[table] = items.filter(item => !this.filters.every(fn => fn(item)));
      writeLocalDb(db);
      return { data: null, error: null };
    }

    // Default: 'select'
    let result = [...items];

    // Apply filters
    if (this.filters.length > 0) {
      result = result.filter(item => this.filters.every(fn => fn(item)));
    }

    // Total count before sort
    const exactCount = result.length;

    // Apply sort
    if (this.sortField) {
      const field = this.sortField;
      const asc = this.sortAscending ? 1 : -1;
      result.sort((a, b) => {
        const va = a[field];
        const vb = b[field];
        if (va === vb) return 0;
        if (va === undefined || va === null) return 1;
        if (vb === undefined || vb === null) return -1;
        if (typeof va === 'number' && typeof vb === 'number') return (va - vb) * asc;
        return String(va).localeCompare(String(vb)) * asc;
      });
    }

    // Count / head only request
    if (this.countOptions?.head && this.countOptions?.count === 'exact') {
      return { data: null, count: exactCount, error: null };
    }

    // Select specific fields
    if (this.fields !== '*' && this.fields) {
      const fieldList = this.fields.split(',').map(f => f.trim());
      result = result.map(item => {
        const picked = {};
        fieldList.forEach(k => { picked[k] = item[k]; });
        return picked;
      });
    }

    if (this.isSingle) {
      return {
        data: result.length > 0 ? result[0] : null,
        count: exactCount,
        error: null
      };
    }

    return {
      data: result,
      count: exactCount,
      error: null
    };
  }

  handleProfile(db) {
    if (!db.profile) db.profile = {};
    const p = db.profile;
    p.id = 1;
    // Harmonize keys for compatibility with routes/profile.js
    p.stat_experience = p.stat_experience || p.stats?.experience || '5';
    p.stat_projects   = p.stat_projects   || p.stats?.projects   || '30';
    p.stat_clients    = p.stat_clients    || p.stats?.clients    || '20';
    p.cv_file         = p.cv_file         || p.cvFile            || '';
    p.photo           = p.photo           || '';

    if (this.operation === 'update' || this.operation === 'upsert') {
      Object.assign(p, this.payload);
      if (!p.stats) p.stats = {};
      if (this.payload.stat_experience) p.stats.experience = this.payload.stat_experience;
      if (this.payload.stat_projects)   p.stats.projects   = this.payload.stat_projects;
      if (this.payload.stat_clients)    p.stats.clients    = this.payload.stat_clients;
      if (this.payload.cv_file)         p.cvFile           = this.payload.cv_file;
      writeLocalDb(db);
      return { data: p, error: null };
    }

    return { data: p, error: null };
  }

  handleChatbot(db) {
    if (!db.chatbot) db.chatbot = {};
    const cb = db.chatbot;
    cb.id = 1;
    cb.bot_name      = cb.bot_name      || cb.botName      || 'Dejenie Bot';
    cb.greeting      = cb.greeting      || "Hi there! 👋 I'm Dejenie's assistant!";
    cb.placeholder   = cb.placeholder   || 'Type a message...';
    cb.color         = cb.color         || '#3b82f6';
    cb.quick_replies = cb.quick_replies || cb.quickReplies || [];

    if (this.operation === 'update' || this.operation === 'upsert') {
      Object.assign(cb, this.payload);
      if (this.payload.bot_name)      cb.botName      = this.payload.bot_name;
      if (this.payload.quick_replies) cb.quickReplies = this.payload.quick_replies;
      writeLocalDb(db);
      return { data: cb, error: null };
    }

    return { data: cb, error: null };
  }

  handleChatbotFaqs(db) {
    if (!db.chatbot) db.chatbot = {};
    if (!Array.isArray(db.chatbot.faqs)) db.chatbot.faqs = [];
    const faqs = db.chatbot.faqs;

    if (this.operation === 'insert') {
      const rows = Array.isArray(this.payload) ? this.payload : [this.payload];
      const inserted = rows.map(r => {
        const item = {
          id: r.id || `faq-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          keywords: r.keywords || [],
          answer: r.answer || '',
          created_at: r.created_at || new Date().toISOString()
        };
        faqs.push(item);
        return item;
      });
      writeLocalDb(db);
      return { data: this.isSingle ? inserted[0] : inserted, error: null };
    }

    if (this.operation === 'update') {
      let updatedItem = null;
      db.chatbot.faqs = faqs.map(item => {
        const matches = this.filters.every(fn => fn(item));
        if (matches) {
          updatedItem = { ...item, ...this.payload };
          return updatedItem;
        }
        return item;
      });
      writeLocalDb(db);
      return { data: updatedItem, error: null };
    }

    if (this.operation === 'delete') {
      db.chatbot.faqs = faqs.filter(item => !this.filters.every(fn => fn(item)));
      writeLocalDb(db);
      return { data: null, error: null };
    }

    let result = [...faqs];
    if (this.filters.length > 0) {
      result = result.filter(item => this.filters.every(fn => fn(item)));
    }
    return { data: this.isSingle ? (result[0] || null) : result, error: null };
  }
}

// Local client mimicking createClient()
const localClient = {
  from(table) {
    return new LocalQueryBuilder(table);
  }
};

let supabase = null;

function getSupabase() {
  if (supabase) return supabase;

  if (isSupabaseConfigured()) {
    try {
      const url = process.env.SUPABASE_URL;
      const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
      supabase = createClient(url, key, { auth: { persistSession: false } });
      console.log('✅ Connected to remote Supabase database');
      return supabase;
    } catch (err) {
      console.warn('⚠️ Supabase connection failed, falling back to local JSON db:', err.message);
    }
  }

  // Fallback to local JSON database
  supabase = localClient;
  console.log('📦 Using local JSON database (api/db.json)');
  return supabase;
}

module.exports = { getSupabase };
