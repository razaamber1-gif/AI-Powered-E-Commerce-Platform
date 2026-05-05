const express = require('express');
const router = express.Router();
const { chatbotSearch } = require('../controllers/chatbot.controller');

router.post('/search', chatbotSearch);

module.exports = router;
