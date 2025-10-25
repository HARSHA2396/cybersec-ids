const fs = require('fs');
const axios = require('axios');
const { Tail } = require('tail');

// Monitor auth.log for failed SSH attempts
const tail = new Tail('/var/log/auth.log');

tail.on('line', async (line) => {
  // Detect failed SSH attempts
  if (line.includes('Failed password')) {
    const ipMatch = line.match(/from (\d+\.\d+\.\d+\.\d+)/);
    const ip = ipMatch ? ipMatch[1] : 'unknown';
    
    await axios.post('http://localhost:5000/api/logs', {
      ip,
      endpoint: 'SSH Login',
      method: 'SYSTEM',
      payload: line,
      detectedBy: 'Linux Auth Log',
      severity: 'high',
      description: 'Failed SSH login attempt detected'
    });
  }
});

console.log('📊 Monitoring Linux auth logs...');
