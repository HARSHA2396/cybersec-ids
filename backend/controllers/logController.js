const SuspiciousLog = require('../models/SuspiciousLog');
const geoip = require('geoip-lite');


// Add new suspicious activity log
exports.addLog = async (req, res) => {
  try {
    const ip = req.body.ip || req.ip;
    const geo = geoip.lookup(ip);
    
    const log = new SuspiciousLog({
      ...req.body,
      ip,
      location: geo ? {
        country: geo.country,
        region: geo.region,
        city: geo.city,
        latitude: geo.ll[0],
        longitude: geo.ll[1]
      } : null
    });
    
    await log.save();

    const io = req.app.get('io');
    io.emit('newLog', log);

    res.status(201).json(log);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// Get recent logs with optional filters
exports.getLogs = async (req, res) => {
  try {
    const { severity, endpoint, limit = 50 } = req.query;
    const filter = {};
    
    if (severity) filter.severity = severity;
    if (endpoint) filter.endpoint = endpoint;
    
    const logs = await SuspiciousLog.find(filter)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));
    
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get statistics
exports.getStats = async (req, res) => {
  try {
    const total = await SuspiciousLog.countDocuments();
    const highSeverity = await SuspiciousLog.countDocuments({ severity: 'high' });
    const mediumSeverity = await SuspiciousLog.countDocuments({ severity: 'medium' });
    const lowSeverity = await SuspiciousLog.countDocuments({ severity: 'low' });
    
    // Top attacked endpoints
    const topEndpoints = await SuspiciousLog.aggregate([
      { $group: { _id: '$endpoint', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);
    
    // Top attack types
    const topAttacks = await SuspiciousLog.aggregate([
      { $group: { _id: '$detectedBy', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);
    
    res.json({
      total,
      bySeverity: { high: highSeverity, medium: mediumSeverity, low: lowSeverity },
      topEndpoints,
      topAttacks
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete all logs (for testing)
exports.clearLogs = async (req, res) => {
  try {
    await SuspiciousLog.deleteMany({});
    res.json({ message: 'All logs cleared' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Export logs as CSV
exports.exportCSV = async (req, res) => {
  try {
    const logs = await SuspiciousLog.find().sort({ timestamp: -1 });
    
    let csv = 'Timestamp,IP,Country,Endpoint,Method,Attack Type,Severity,Description\n';
    
    logs.forEach(log => {
      const country = log.location?.country || 'Unknown';
      csv += `"${log.timestamp}","${log.ip}","${country}","${log.endpoint}","${log.method}","${log.detectedBy}","${log.severity}","${log.description}"\n`;
    });
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=security-logs.csv');
    res.send(csv);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

