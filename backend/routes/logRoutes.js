const express = require('express');
const router = express.Router();
const logController = require('../controllers/logController');
const ruleEngine = require('../detection/ruleEngine');

router.post('/', ruleEngine, logController.addLog);
router.get('/', logController.getLogs);
router.get('/stats', logController.getStats);
router.delete('/clear', logController.clearLogs);
router.get('/export/csv', logController.exportCSV);


module.exports = router;
