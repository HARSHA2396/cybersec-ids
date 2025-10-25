const axios = require('axios');

// Middleware to log all requests to IDS
const idsLogger = async (req, res, next) => {
  // Check for suspicious patterns
  const payload = JSON.stringify(req.body) || req.query.toString() || '';
  let suspicious = false;
  let severity = 'low';
  let detectedBy = 'Normal Request';
  
  // XSS detection
  if (/<script>|<iframe>|onerror=/i.test(payload)) {
    suspicious = true;
    severity = 'high';
    detectedBy = 'XSS Detection';
  }
  
  // SQL Injection detection
  if (/'|--|union select|drop table/i.test(payload)) {
    suspicious = true;
    severity = 'high';
    detectedBy = 'SQL Injection Detection';
  }
  
  // Only log suspicious requests
  if (suspicious) {
    try {
      await axios.post('http://localhost:5000/api/logs', {
        ip: req.ip || req.connection.remoteAddress,
        endpoint: req.path,
        method: req.method,
        payload,
        userAgent: req.headers['user-agent'],
        detectedBy,
        severity,
        description: `Suspicious ${req.method} request to ${req.path}`
      });
    } catch (err) {
      console.error('IDS logging failed:', err.message);
    }
  }
  
  next();
};

module.exports = idsLogger;
