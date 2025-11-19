const mongoose = require('mongoose');

const LinkSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, index: true },
  target_url: { type: String, required: true },
  total_clicks: { type: Number, default: 0 },
  last_clicked: { type: Date, default: null },
  created_at: { type: Date, default: () => new Date() }
});

module.exports = mongoose.model('Link', LinkSchema);
