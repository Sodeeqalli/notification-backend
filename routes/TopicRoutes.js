const express = require('express');
const router = express.Router();
const authenticate = require('../middlewares/Authenticate');
const {
  createTopic,
  searchTopics,
  searchPrivateTopic,
  joinTopic,
} = require('../controllers/TopicController');

// Create a topic
router.post('/', authenticate, createTopic);

// Search public topics
router.get('/search', authenticate, searchTopics);

// Search private topic by secret ID
router.post('/private/search', authenticate, searchPrivateTopic);

// Join a topic
router.post('/join', authenticate, joinTopic);

module.exports = router;
