const express = require('express');
const router = express.Router();
const { generateMessage, chatAssistant } = require('../controllers/aiController');

router.post('/generate-message', generateMessage);
router.post('/chat', chatAssistant);

module.exports = router;
