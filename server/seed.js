/**
 * seed.js — run ONCE to migrate your db.json data into MongoDB Atlas
 * Usage: node seed.js
 */
require('dotenv').config();
const mongoose      = require('mongoose');
const fs            = require('fs');
const path          = require('path');

const Profile       = require('./models/Profile');
const Experience    = require('./models/Experience');
const Skill         = require('./models/Skill');
const Project       = require('./models/Project');
const Service       = require('./models/Service');
const Certification = require('./models/Certification');
const Gallery       = require('./models/Gallery');
const Message       = require('./models/Message');
const Chatbot       = require('./models/Chatbot');

async function seed() {
  console.log('\n🌱 Starting seed...\n');

  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected to MongoDB\n');

  // Read db.json
  const dbPath = path.join(__dirname, 'db.json');
  const data   = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));

  // ── Profile ──
  await Profile.deleteMany({});
  await Profile.create(data.profile);
  console.log('✅ Profile seeded');

  // ── Experience ──
  await Experience.deleteMany({});
  await Experience.insertMany(data.experience.map(e => ({
    title: e.title, company: e.company, period: e.period,
    description: e.description, tags: e.tags || [], order: e.order || 0
  })));
  console.log(`✅ Experience seeded (${data.experience.length} entries)`);

  // ── Skills ──
  await Skill.deleteMany({});
  await Skill.insertMany(data.skills.map(s => ({
    name: s.name, percentage: s.percentage,
    category: s.category || 'Technical', order: s.order || 0
  })));
  console.log(`✅ Skills seeded (${data.skills.length} skills)`);

  // ── Projects ──
  await Project.deleteMany({});
  await Project.insertMany(data.projects.map(p => ({
    title: p.title, description: p.description,
    tags: p.tags || [], image: p.image || '',
    link: p.link || '#', order: p.order || 0
  })));
  console.log(`✅ Projects seeded (${data.projects.length} projects)`);

  // ── Services ──
  await Service.deleteMany({});
  await Service.insertMany(data.services.map(s => ({
    title: s.title, description: s.description,
    icon: s.icon || 'fas fa-cog', color: s.color || '#3b82f6', order: s.order || 0
  })));
  console.log(`✅ Services seeded (${data.services.length} services)`);

  // ── Certifications ──
  await Certification.deleteMany({});
  await Certification.insertMany(data.certifications.map(c => ({
    title: c.title, issuer: c.issuer, year: c.year,
    category: c.category, icon: c.icon || 'fas fa-certificate',
    color: c.color || '#3b82f6', order: c.order || 0
  })));
  console.log(`✅ Certifications seeded (${data.certifications.length} certs)`);

  // ── Gallery ──
  await Gallery.deleteMany({});
  if (data.gallery?.length) {
    await Gallery.insertMany(data.gallery.map(g => ({
      url: g.url || '', caption: g.caption || ''
    })));
    console.log(`✅ Gallery seeded (${data.gallery.length} photos)`);
  } else {
    console.log('ℹ️  Gallery empty — skipped');
  }

  // ── Messages ──
  await Message.deleteMany({});
  if (data.messages?.length) {
    await Message.insertMany(data.messages.map(m => ({
      name: m.name, email: m.email,
      subject: m.subject || '(no subject)',
      message: m.message, read: m.read || false
    })));
    console.log(`✅ Messages seeded (${data.messages.length} messages)`);
  } else {
    console.log('ℹ️  Messages empty — skipped');
  }

  // ── Chatbot ──
  await Chatbot.deleteMany({});
  const cb = data.chatbot || {};
  await Chatbot.create({
    enabled:      cb.enabled !== false,
    botName:      cb.botName      || 'Dejenie Bot',
    greeting:     cb.greeting     || "Hi there! 👋 I'm Dejenie's assistant!",
    placeholder:  cb.placeholder  || 'Type a message...',
    color:        cb.color        || '#3b82f6',
    quickReplies: cb.quickReplies || [],
    faqs: (cb.faqs || []).map(f => ({
      keywords: f.keywords || [],
      answer:   f.answer   || ''
    }))
  });
  console.log(`✅ Chatbot seeded (${(cb.faqs||[]).length} FAQs)`);

  console.log('\n🎉 Seed complete! All data is now in MongoDB.\n');
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});
