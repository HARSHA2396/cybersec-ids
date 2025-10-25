const BlockedIP = require('../models/BlockedIP');

// Block an IP
exports.blockIP = async (req, res) => {
  try {
    const { ip, reason, duration } = req.body; // duration in minutes
    
    const expiresAt = duration 
      ? new Date(Date.now() + duration * 60000)
      : null; // null = permanent
    
    const blocked = await BlockedIP.findOneAndUpdate(
      { ip },
      { 
        ip, 
        reason, 
        expiresAt,
        $inc: { attackCount: 1 }
      },
      { upsert: true, new: true }
    );
    
    res.json({ message: 'IP blocked successfully', blocked });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all blocked IPs
exports.getBlockedIPs = async (req, res) => {
  try {
    const blocked = await BlockedIP.find().sort({ blockedAt: -1 });
    res.json(blocked);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Unblock an IP
exports.unblockIP = async (req, res) => {
  try {
    const { ip } = req.params;
    await BlockedIP.deleteOne({ ip });
    res.json({ message: 'IP unblocked successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
