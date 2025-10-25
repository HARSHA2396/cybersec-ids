const fs = require('fs');
const { Tail } = require('tail');
const axios = require('axios');

// Monitor Nginx access log
const tail = new Tail('/var/log/nginx/access.log');

tail.on('line', async (line) => {
  // Parse log line (Nginx format)
  const match = line.match(/^(\S+) .* "(.*?)" (\d+)/);
  
  if (match) {
    const [, ip, request, statusCode] = match;
    
    // Detect suspicious patterns
    if (request.includes('<script>') || 
        request.includes('union select') || 
        request.includes('../')) {
      
      await axios.post('http://localhost:5000/api/logs', {
        ip,
        endpoint: request.split(' ')[1] || '/',
        method: request.split(' ')[0] || 'GET',
        payload: request,
        detectedBy: 'Web Server Log Analysis',
        severity: 'high',
        description: 'Suspicious request pattern in web server logs'
      });
    }
  }
});

console.log('📊 Monitoring Nginx access logs...');
