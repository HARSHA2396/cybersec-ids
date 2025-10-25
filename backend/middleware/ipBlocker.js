const BlockedIP = require('../models/BlockedIP');

const ipBlocker = async (req, res, next) => {
  const clientIp = req.body.ip || req.ip || req.connection.remoteAddress;
  
  // Check if IP is blocked
  const blocked = await BlockedIP.findOne({ 
    ip: clientIp,
    $or: [
      { expiresAt: { $exists: false } }, // Permanent block
      { expiresAt: { $gt: new Date() } }  // Temporary block not expired
    ]
  });
  
  if (blocked) {
    return res.status(403).json({ 
      error: 'Access Denied',
      message: 'Your IP has been blocked due to suspicious activity',
      reason: blocked.reason,
      blockedAt: blocked.blockedAt
    });
  }
  
  next();
};

module.exports = ipBlocker;
