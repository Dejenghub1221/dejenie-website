/**
 * seed-supabase.js
 * Pushes all data from db.json into Supabase tables.
 * Run once: node api/seed-supabase.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false } });
const db = JSON.parse(fs.readFileSync(path.join(__dirname, 'db.json'), 'utf-8'));

async function seed() {
  console.log('🌱 Starting Supabase seed from db.json...\n');

  // ── Profile ──────────────────────────────────────────────────────
  console.log('→ Seeding profile...');
  const p = db.profile;
  const profileRow = {
    name: p.name,
    title: p.title,
    tagline: p.tagline,
    headline: p.headline,
    bio: p.bio,
    about1: p.about1,
    about2: p.about2,
    about3: p.about3,
    location: p.location,
    email: p.email,
    phone: p.phone,
    availability: p.availability,
    linkedin: p.linkedin,
    github: p.github,
    twitter: p.twitter,
    telegram: p.telegram,
    photo: p.photo || '',
    cv_file: p.cv_file || p.cvFile || '',
    stat_experience: p.stat_experience || p.stats?.experience || '5',
    stat_projects: p.stat_projects || p.stats?.projects || '30',
    stat_clients: p.stat_clients || p.stats?.clients || '20',
    updated_at: p.updated_at || new Date().toISOString(),
  };
  // First delete existing row, then insert fresh
  await supabase.from('profile').delete().neq('id', 0);
  const { error: profileErr } = await supabase.from('profile').insert(profileRow);
  if (profileErr) console.error('  ❌ profile:', profileErr.message);
  else console.log('  ✅ profile seeded');

  // ── Experience ───────────────────────────────────────────────────
  console.log('→ Seeding experience...');
  if (db.experience?.length) {
    const rows = db.experience.map(e => ({
      id: e.id,
      title: e.title,
      company: e.company,
      period: e.period,
      description: e.description,
      tags: e.tags || [],
      order: e.order || 0,
    }));
    const { error } = await supabase.from('experience').upsert(rows);
    if (error) console.error('  ❌ experience:', error.message);
    else console.log(`  ✅ ${rows.length} experience records seeded`);
  }

  // ── Skills ───────────────────────────────────────────────────────
  console.log('→ Seeding skills...');
  if (db.skills?.length) {
    const rows = db.skills.map(s => ({
      id: s.id,
      name: s.name,
      percentage: s.percentage,
      category: s.category || 'Technical',
      order: s.order || 0,
    }));
    const { error } = await supabase.from('skills').upsert(rows);
    if (error) console.error('  ❌ skills:', error.message);
    else console.log(`  ✅ ${rows.length} skills seeded`);
  }

  // ── Projects ─────────────────────────────────────────────────────
  console.log('→ Seeding projects...');
  if (db.projects?.length) {
    const rows = db.projects.map(pr => ({
      id: pr.id,
      title: pr.title,
      description: pr.description,
      tags: pr.tags || [],
      image: pr.image || '',
      link: pr.link || '#',
      order: pr.order || 0,
    }));
    const { error } = await supabase.from('projects').upsert(rows);
    if (error) console.error('  ❌ projects:', error.message);
    else console.log(`  ✅ ${rows.length} projects seeded`);
  }

  // ── Services ─────────────────────────────────────────────────────
  console.log('→ Seeding services...');
  if (db.services?.length) {
    const rows = db.services.map(sv => ({
      id: sv.id,
      title: sv.title,
      description: sv.description,
      icon: sv.icon || '',
      color: sv.color || '#3b82f6',
      order: sv.order || 0,
    }));
    const { error } = await supabase.from('services').upsert(rows);
    if (error) console.error('  ❌ services:', error.message);
    else console.log(`  ✅ ${rows.length} services seeded`);
  }

  // ── Certifications ───────────────────────────────────────────────
  console.log('→ Seeding certifications...');
  if (db.certifications?.length) {
    const rows = db.certifications.map(c => ({
      id: c.id,
      title: c.title,
      issuer: c.issuer,
      year: c.year,
      category: c.category || '',
      icon: c.icon || '',
      color: c.color || '#3b82f6',
      order: c.order || 0,
    }));
    const { error } = await supabase.from('certifications').upsert(rows);
    if (error) console.error('  ❌ certifications:', error.message);
    else console.log(`  ✅ ${rows.length} certifications seeded`);
  }

  // ── Chatbot ──────────────────────────────────────────────────────
  console.log('→ Seeding chatbot config...');
  const cb = db.chatbot || {};
  const chatbotRow = {
    enabled: cb.enabled !== false,
    bot_name: cb.botName || cb.bot_name || 'Dejenie Bot',
    greeting: cb.greeting || "Hi there! I'm Dejenie's assistant!",
    placeholder: cb.placeholder || 'Type a message...',
    color: cb.color || '#3b82f6',
    quick_replies: cb.quickReplies || cb.quick_replies || [],
  };
  await supabase.from('chatbot').delete().neq('id', 0);
  const { error: cbErr } = await supabase.from('chatbot').insert(chatbotRow);
  if (cbErr) console.error('  ❌ chatbot:', cbErr.message);
  else console.log('  ✅ chatbot config seeded');

  // ── Chatbot FAQs ─────────────────────────────────────────────────
  if (cb.faqs?.length) {
    console.log('→ Seeding chatbot FAQs...');
    const rows = cb.faqs.map(f => ({
      id: f.id,
      keywords: f.keywords || [],
      answer: f.answer || '',
    }));
    const { error } = await supabase.from('chatbot_faqs').upsert(rows);
    if (error) console.error('  ❌ chatbot_faqs:', error.message);
    else console.log(`  ✅ ${rows.length} FAQs seeded`);
  }

  console.log('\n🎉 Seed complete!');
}

seed().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
