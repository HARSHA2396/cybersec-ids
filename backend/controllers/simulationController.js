const axios = require('axios');

exports.simulateAttacks = async (req, res) => {
  const attacks = [
    {
      name: 'XSS Attack in Comments',
      payload: {
        ip: '192.168.1.100',
        endpoint: '/comments',
        method: 'POST',
        payload: '<script>alert("XSS")</script>',
        userAgent: 'Mozilla/5.0'
      }
    },
    {
      name: 'SQL Injection in Login',
      payload: {
        ip: '203.0.113.50',
        endpoint: '/login',
        method: 'POST',
        payload: "username=admin' OR '1'='1&password=test",
        userAgent: 'Chrome/90'
      }
    },
    {
      name: 'Directory Traversal',
      payload: {
        ip: '198.51.100.20',
        endpoint: '/files',
        method: 'GET',
        payload: 'filename=../../etc/passwd',
        userAgent: 'curl/7.68'
      }
    },
    {
      name: 'Command Injection',
      payload: {
        ip: '10.0.0.50',
        endpoint: '/ping',
        method: 'POST',
        payload: 'host=example.com;rm -rf /',
        userAgent: 'PostmanRuntime/7.26'
      }
    },
    {
      name: 'Brute Force Attack',
      payload: {
        ip: '172.16.0.10',
        endpoint: '/login',
        method: 'POST',
        payload: 'username=admin&password=wrongpass',
        failedAttempts: 7,
        userAgent: 'Python-requests/2.25'
      }
    },
    {
      name: 'Path Manipulation',
      payload: {
        ip: '45.33.32.156',
        endpoint: '/files',
        method: 'GET',
        payload: 'path=/etc/passwd',
        userAgent: 'curl/7.68'
      }
    },
    {
      name: 'XML Injection',
      payload: {
        ip: '104.24.113.45',
        endpoint: '/api/xml',
        method: 'POST',
        payload: '<!DOCTYPE foo [<!ENTITY xxe SYSTEM "file:///etc/passwd">]>',
        userAgent: 'Java/1.8'
      }
    },
    {
      name: 'Suspicious Scanner Detected',
      payload: {
        ip: '80.82.77.139',
        endpoint: '/admin',
        method: 'GET',
        payload: '',
        userAgent: 'sqlmap/1.5.2'
      }
    }
  ];

  try {
    const results = [];
    
    for (const attack of attacks) {
      try {
        const response = await axios.post('http://localhost:5000/api/logs', attack.payload);
        results.push({ 
          attack: attack.name, 
          status: 'Simulated Successfully', 
          id: response.data._id 
        });
      } catch (err) {
        results.push({ 
          attack: attack.name, 
          status: 'Failed', 
          error: err.message 
        });
      }
      
      // Wait 500ms between attacks for realistic simulation
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    res.json({ 
      message: 'Attack simulation completed', 
      totalSimulated: attacks.length,
      results 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
