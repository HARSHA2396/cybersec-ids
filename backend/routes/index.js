const express = require('express');
const router = express.Router();

router.use('/logs', require('./logRoutes'));
router.use('/blocks', require('./blockRoutes'));
router.use('/simulation', require('./simulationRoutes'));
router.get('/health', (req, res) => res.json({ status: 'Backend is healthy!' }));

module.exports = router;
