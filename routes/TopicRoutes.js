const express = require('express');
const router = express.Router();
const authenticate = require('../middlewares/Authenticate');
const {
  createTopic,
  searchTopics,
  searchPrivateTopic,
  joinTopic,
  getTopicDetails,
  getMyTopics,
  getTopicSubscribers,
  getSubscribedTopics,
  unsubscribeFromTopic
} = require('../controllers/TopicController');

// Create a topic
router.post('/', authenticate, createTopic);

// Search public topics
router.post('/search', authenticate, searchTopics);

// Search private topic by secret ID
router.post('/private/search', authenticate, searchPrivateTopic);

// Join a topic
router.post('/join', authenticate, joinTopic);

// Get all topics the authenticated user is subscribed to
router.get('/subscribed', authenticate, getSubscribedTopics);


// Get topic details (including number of subscribers)
router.get('/:topicId', authenticate, getTopicDetails);

// Get all topics created by the authenticated user
router.get('/my/topics', authenticate, getMyTopics);

// Get all subscribers of a particular topic (only for topic creators)
router.get('/:topicId/subscribers', authenticate, getTopicSubscribers);


// Unsubscribe from a topic
router.post('/unsubscribe', authenticate, unsubscribeFromTopic);

module.exports = router;
