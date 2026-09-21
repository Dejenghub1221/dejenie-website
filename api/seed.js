/**
 * seed.js — Run ONCE to migrate db.json → Supabase
 * Usage: node seed.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const fs   = require('fs');
const path = require('path');
const { getSupabase } = require('./db-supabase');

async function seed() {
  console.log('\n🌱 Seeding Supabase from db.json...\n');

  const db = JSON.parse(fs.readFileSync(path.join(__dirname, 'db.json'), 'utf-8'));
  const sb = getSupabase();

  // ── Profile ──
  const p = db.profile;
  const { error: pErr } = await sb.from('profile').upsert({
    id: 1,
    name: p.name, title: p.title, tagline: p.tagline,
    headline: p.headline, bio: p.bio,
    about1: p.about1, about2: p.about2, about3: p.about3,
    location: p.location, email: p.email, phone: p.phone,
    availability: p.availability,
    linkedin: p.linkedin, github: p.github, twitter: p.twitter, telegram: p.telegram,
    cv_file: p.cvFile || '', photo: p.photo || '',
    stat_experience: p.stats?.experience || '5',
    stat_projects:   p.stats?.projects   || '30',
    stat_clients:    p.stats?.clients    || '20'
  }, { onConflict: 'id' });
  if (pErr) { console.error('Profile error:', pErr.message); } else { console.log('✅ Profile'); }

  // ── Experience ──
  await sb.from('experience').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  const { error: eErr } = await sb.from('experience').insert(
    db.experience.map(e => ({
      title: e.title, company: e.company, period: e.period,
      description: e.description, tags: e.tags || [], order: e.order || 0
    }))
  );
  if (eErr) { console.error('Experience error:', eErr.message); } else { console.log(`✅ Experience (${db.experience.length})`); }

  // ── Skills ──
  await sb.from('skills').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  const { error: sErr } = await sb.from('skills').insert(
    db.skills.map(s => ({ name: s.name, percentage: s.percentage, category: s.category || 'Technical', order: s.order || 0 }))
  );
  if (sErr) { console.error('Skills error:', sErr.message); } else { console.log(`✅ Skills (${db.skills.length})`); }

  // ── Projects ──
  await sb.from('projects').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  const { error: prErr } = await sb.from('projects').insert(
    db.projects.map(p => ({ title: p.title, description: p.description, tags: p.tags || [], image: p.image || '', link: p.link || '#', order: p.order || 0 }))
  );
  if (prErr) { console.error('Projects error:', prErr.message); } else { console.log(`✅ Projects (${db.projects.length})`); }

  // ── Services ──
  await sb.from('services').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  const { error: svErr } = await sb.from('services').insert(
    db.services.map(s => ({ title: s.title, description: s.description, icon: s.icon, color: s.color, order: s.order || 0 }))
  );
  if (svErr) { console.error('Services error:', svErr.message); } else { console.log(`✅ Services (${db.services.length})`); }

  // ── Certifications ──
  await sb.from('certifications').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  const { error: cErr } = await sb.from('certifications').insert(
    db.certifications.map(c => ({ title: c.title, issuer: c.issuer, year: c.year, category: c.category, icon: c.icon, color: c.color, order: c.order || 0 }))
  );
  if (cErr) { console.error('Certifications error:', cErr.message); } else { console.log(`✅ Certifications (${db.certifications.length})`); }

  // ── Chatbot ──
  const cb = db.chatbot || {};
  const { error: botErr } = await sb.from('chatbot').upsert({
    id: 1,
    enabled:      cb.enabled !== false,
    bot_name:     cb.botName     || 'Dejenie Bot',
    greeting:     cb.greeting    || "Hi there! 👋 I'm Dejenie's assistant!",
    placeholder:  cb.placeholder || 'Type a message...',
    color:        cb.color       || '#3b82f6',
    quick_replies: cb.quickReplies || []
  }, { onConflict: 'id' });
  if (botErr) { console.error('Chatbot error:', botErr.message); } else { console.log('✅ Chatbot config'); }

  if (cb.faqs?.length) {
    await sb.from('chatbot_faqs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    const { error: fErr } = await sb.from('chatbot_faqs').insert(
      cb.faqs.map(f => ({ keywords: f.keywords || [], answer: f.answer }))
    );
    if (fErr) { console.error('FAQs error:', fErr.message); } else { console.log(`✅ Chatbot FAQs (${cb.faqs.length})`); }
  }

  console.log('\n🎉 Seed complete! All data is now in Supabase.\n');
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});
