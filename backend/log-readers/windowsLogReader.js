const EventLog = require('node-eventlog');
const axios = require('axios');

// Monitor Windows Security logs
const log = new EventLog('Security');

log.on('entry', async (entry) => {
  // Filter for security-relevant events
  if (entry.eventID === 4625) { // Failed login
    await axios.post('http://localhost:5000/api/logs', {
      ip: entry.computerName,
      endpoint: 'Windows Login',
      method: 'SYSTEM',
      payload: JSON.stringify(entry),
      detectedBy: 'Windows Event Log',
      severity: 'medium',
      description: `Failed login attempt on ${entry.computerName}`
    });
  }
});

console.log('📊 Monitoring Windows Event Logs...');
