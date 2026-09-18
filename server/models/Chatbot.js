const mongoose = require('mongoose');

const faqSchema = new mongoose.Schema({
  keywords: [{ type: String }],
  answer:   { type: String, required: true }
});

const chatbotSchema = new mongoose.Schema({
  enabled:      { type: Boolean, default: true },
  botName:      { type: String, default: 'Dejenie Bot' },
  greeting:     { type: String, default: "Hi there! 👋 I'm Dejenie's assistant. Ask me anything!" },
  placeholder:  { type: String, default: 'Type a message...' },
  color:        { type: String, default: '#3b82f6' },
  quickReplies: [{ type: String }],
  faqs:         [faqSchema]
}, { timestamps: true });

module.exports = mongoose.model('Chatbot', chatbotSchema);
