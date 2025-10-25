// backend/detection/ruleEngine.js
const SuspiciousLog = require('../models/SuspiciousLog');

// Comprehensive rule set for various attack types
const rules = [
  {
    rule: 'XSS in Comments',
    match: (req) => 
      req.endpoint === '/comments' && 
      /<script>|<iframe>|onerror=|onload=|javascript:|<img[^>]+src/i.test(req.payload),
    severity: 'high',
    description: 'Potential XSS (Cross-Site Scripting) attack in comments section'
  },
  {
    rule: 'SQL Injection in Login',
    match: (req) => 
      req.endpoint === '/login' && 
      /('|--|;|union|select|insert|delete|update|drop|exec|execute)/i.test(req.payload),
    severity: 'high',
    description: 'Potential SQL Injection in login attempt'
  },
  {
    rule: 'SQL Injection Generic',
    match: (req) => 
      /(union.*select|select.*from|insert.*into|delete.*from|update.*set|drop.*table)/i.test(req.payload),
    severity: 'high',
    description: 'Potential SQL Injection detected'
  },
  {
    rule: 'Brute Force Login',
    match: (req) => 
      req.endpoint === '/login' && 
      req.method === 'POST' && 
      req.failedAttempts && 
      req.failedAttempts > 5,
    severity: 'medium',
    description: 'Multiple failed login attempts—potential brute force attack'
  },
  {
    rule: 'Directory Traversal',
    match: (req) => 
      /(\.\.[\/\\]|\.\.%2f|\.\.%5c)/i.test(req.payload),
    severity: 'high',
    description: 'Potential Directory Traversal attack detected'
  },
  {
    rule: 'Command Injection',
    match: (req) => 
      /(\||;|&&|\$\(|\`|<\(|>\()/i.test(req.payload),
    severity: 'high',
    description: 'Potential Command Injection attack detected'
  },
  {
    rule: 'LDAP Injection',
    match: (req) => 
      /(\*\)|\(\||\)\(|%2a%29|%28%7c)/i.test(req.payload),
    severity: 'medium',
    description: 'Potential LDAP Injection detected'
  },
  {
    rule: 'XML Injection',
    match: (req) => 
      /<!\[CDATA\[|<!DOCTYPE|<!ENTITY/i.test(req.payload),
    severity: 'medium',
    description: 'Potential XML/XXE Injection detected'
  },
  {
    rule: 'Path Manipulation',
    match: (req) => 
      /(\/etc\/passwd|\/etc\/shadow|c:\\windows\\system32)/i.test(req.payload),
    severity: 'high',
    description: 'Potential Path Manipulation—attempting to access sensitive files'
  },
  {
    rule: 'Suspicious User Agent',
    match: (req) => 
      req.userAgent && 
      /(sqlmap|nikto|nmap|masscan|burp|metasploit)/i.test(req.userAgent),
    severity: 'medium',
    description: 'Suspicious User-Agent—possible scanning tool detected'
  }
];

// IP-based tracking for rate limiting (in-memory for demo; use Redis in production)
const ipAttempts = {};

const ruleEngine = async (req, res, next) => {
  const clientIp = req.body.ip || req.ip;
  
  // Track failed attempts for brute force detection
  if (req.body.endpoint === '/login' && req.body.method === 'POST') {
    if (!ipAttempts[clientIp]) {
      ipAttempts[clientIp] = { count: 0, firstAttempt: Date.now() };
    }
    ipAttempts[clientIp].count++;
    req.body.failedAttempts = ipAttempts[clientIp].count;
    
    // Reset after 5 minutes
    if (Date.now() - ipAttempts[clientIp].firstAttempt > 300000) {
      ipAttempts[clientIp] = { count: 1, firstAttempt: Date.now() };
    }
  }

  // Check all rules
  for (const r of rules) {
    if (r.match(req.body)) {
      // Log suspicious activity
      const log = new SuspiciousLog({
        ip: clientIp,
        endpoint: req.body.endpoint,
        method: req.body.method,
        payload: req.body.payload,
        userAgent: req.body.userAgent,
        detectedBy: r.rule,
        severity: r.severity,
        description: r.description
      });
      
      await log.save();

      // Inside the for loop where rules are checked, after log.save():

// Auto-block IPs with high severity attacks after 3 incidents
if (r.severity === 'high') {
  const recentAttacks = await SuspiciousLog.countDocuments({
    ip: clientIp,
    severity: 'high',
    timestamp: { $gte: new Date(Date.now() - 3600000) } // Last hour
  });
  
  if (recentAttacks >= 3) {
    const BlockedIP = require('../models/BlockedIP');
    await BlockedIP.findOneAndUpdate(
      { ip: clientIp },
      { 
        ip: clientIp,
        reason: `Auto-blocked: ${recentAttacks} high-severity attacks in 1 hour`,
        expiresAt: new Date(Date.now() + 24 * 3600000), // 24 hours
        $inc: { attackCount: 1 }
      },
      { upsert: true }
    );
    
    console.log(`🚫 AUTO-BLOCKED IP: ${clientIp} (${recentAttacks} attacks)`);
    io.emit('ipBlocked', { ip: clientIp, reason: 'Auto-blocked due to repeated attacks' });
  }
}

      
      // Emit real-time notification via Socket.io
      const io = req.app.get('io');
      io.emit('newLog', log);
      
      // Optional: Implement blocking logic
      if (r.severity === 'high') {
        // In production, add IP to blocklist, send alerts, etc.
        console.log(`🚨 HIGH SEVERITY THREAT from ${clientIp}: ${r.rule}`);
      }
      
      break; // Stop at first matched rule
    }
  }
  
  next();
};

module.exports = ruleEngine;
