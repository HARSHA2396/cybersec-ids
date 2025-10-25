const express = require('express');
const router = express.Router();
const blockController = require('../controllers/blockController');

router.post('/', blockController.blockIP);
router.get('/', blockController.getBlockedIPs);
router.delete('/:ip', blockController.unblockIP);

module.exports = router;
