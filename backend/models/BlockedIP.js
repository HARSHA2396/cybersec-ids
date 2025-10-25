const mongoose = require('mongoose');

const blockedIPSchema = new mongoose.Schema({
  ip: { type: String, required: true, unique: true },
  reason: String,
  blockedAt: { type: Date, default: Date.now },
  expiresAt: Date,
  attackCount: { type: Number, default: 1 }
});

module.exports = mongoose.model('BlockedIP', blockedIPSchema);
