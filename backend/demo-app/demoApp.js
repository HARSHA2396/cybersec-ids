const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Helper function to log to IDS
async function logToIDS(req, detectedBy, severity, description) {
  try {
    await axios.post('http://localhost:5000/api/logs', {
      ip: req.ip || req.connection.remoteAddress || '127.0.0.1',
      endpoint: req.path,
      method: req.method,
      payload: JSON.stringify(req.body) || JSON.stringify(req.query) || '',
      userAgent: req.headers['user-agent'],
      detectedBy,
      severity,
      description
    });
  } catch (err) {
    console.error('❌ Failed to log to IDS:', err.message);
  }
}

// ========== VULNERABLE ENDPOINTS ==========

// Home page
app.get('/', (req, res) => {
  res.send(`
    <h1>🌐 Demo Vulnerable Web Application</h1>
    <p>This app is monitored by the IDS system running on port 5000</p>
    <h3>Available Endpoints:</h3>
    <ul>
      <li>POST /login - Login form (vulnerable to SQL injection)</li>
      <li>POST /comments - Comment submission (vulnerable to XSS)</li>
      <li>GET /file?path=... - File access (vulnerable to path traversal)</li>
      <li>POST /search - Search feature (vulnerable to command injection)</li>
    </ul>
    <p><strong>Try attacking these endpoints to see real-time IDS detection!</strong></p>
  `);
});

// VULNERABLE: Login endpoint (SQL Injection)
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  
  console.log(`🔐 Login attempt: ${username}`);
  
  // Detect SQL Injection
  if (/'|--|;|union|select|drop|insert|delete/i.test(username) || 
      /'|--|;|union|select|drop|insert|delete/i.test(password)) {
    await logToIDS(req, 'SQL Injection in Login', 'high', 
      'SQL Injection attempt detected in login form');
    return res.status(400).json({ 
      error: '🚫 Malicious input detected and logged to IDS!' 
    });
  }
  
  // Weak authentication (for demo)
  if (username === 'admin' && password === 'admin123') {
    res.json({ success: true, message: '✅ Login successful' });
  } else {
    await logToIDS(req, 'Failed Login Attempt', 'low', 
      `Failed login attempt for user: ${username}`);
    res.status(401).json({ error: '❌ Invalid credentials' });
  }
});

// VULNERABLE: Comment endpoint (XSS)
app.post('/comments', async (req, res) => {
  const { comment, author } = req.body;
  
  console.log(`💬 Comment submitted by ${author}`);
  
  // Detect XSS
  if (/<script>|<iframe>|onerror=|onload=|javascript:/i.test(comment)) {
    await logToIDS(req, 'XSS in Comments', 'high', 
      'XSS attack attempt detected in comment submission');
    return res.status(400).json({ 
      error: '🚫 Malicious content detected and logged to IDS!' 
    });
  }
  
  res.json({ 
    success: true, 
    message: '✅ Comment posted successfully',
    comment,
    author 
  });
});

// VULNERABLE: File access (Directory Traversal)
app.get('/file', async (req, res) => {
  const { path } = req.query;
  
  console.log(`📁 File access request: ${path}`);
  
  // Detect directory traversal
  if (/\.\.[\/\\]|\.\.%2f|\.\.%5c|\/etc\/|c:\\windows/i.test(path)) {
    await logToIDS(req, 'Directory Traversal', 'high', 
      'Path traversal attempt detected in file access');
    return res.status(400).json({ 
      error: '🚫 Invalid path detected and logged to IDS!' 
    });
  }
  
  res.json({ 
    success: true, 
    message: '✅ File accessed',
    path 
  });
});

// VULNERABLE: Search (Command Injection)
app.post('/search', async (req, res) => {
  const { query } = req.body;
  
  console.log(`🔍 Search query: ${query}`);
  
  // Detect command injection
  if (/\||;|&&|\$\(|`|<\(|>\(/i.test(query)) {
    await logToIDS(req, 'Command Injection', 'high', 
      'Command injection attempt detected in search query');
    return res.status(400).json({ 
      error: '🚫 Malicious query detected and logged to IDS!' 
    });
  }
  
  res.json({ 
    success: true, 
    results: [`Result 1 for "${query}"`, `Result 2 for "${query}"`],
    query 
  });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`🌐 Demo Vulnerable App running on http://localhost:${PORT}`);
  console.log(`📡 All suspicious activity is logged to IDS at http://localhost:5000`);
  console.log(`\n💡 Try these attack examples:\n`);
  console.log(`   POST http://localhost:3001/login`);
  console.log(`   Body: { "username": "admin' OR '1'='1", "password": "test" }\n`);
  console.log(`   POST http://localhost:3001/comments`);
  console.log(`   Body: { "comment": "<script>alert('XSS')</script>", "author": "hacker" }\n`);
});
