const mongoose = require('mongoose');

const suspiciousLogSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  ip: String,
  endpoint: String,
  method: String,
  payload: String,
  userAgent: String,
  detectedBy: String,
  severity: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  description: String,
  blocked: { type: Boolean, default: false },
  location: {
    country: String,
    region: String,
    city: String,
    latitude: Number,
    longitude: Number
  }
});

module.exports = mongoose.model('SuspiciousLog', suspiciousLogSchema);
