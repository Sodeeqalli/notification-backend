const Topic = require('../models/Topic'); // Import Topic model

// Create Topic
const createTopic = async (req, res) => {
  const { name, description, type, secretId } = req.body;

  if (!name || !type) {
    return res.status(400).json({ message: 'Name and type are required.' });
  }

  if (type === 'private' && !secretId) {
    return res.status(400).json({ message: 'Secret ID is required for private topics.' });
  }

  try {
    const topicExists = await Topic.findOne({ name });

    if (topicExists) {
      return res.status(400).json({ message: 'Topic with the name already exists.' });
    }

    const topic = new Topic({
      name,
      description,
      type,
      secretId: type === 'private' ? secretId : null,
      creator: req.user.id,
    });

    await topic.save();
    res.status(201).json({ message: 'Topic created successfully', topic });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Search public topics
const searchTopics = async (req, res) => {
  try {
    const { name } = req.body;
    const query = { type: 'public' };

    if (name && typeof name === 'string' && name.trim() !== '') {
      query.name = { $regex: `.*${name.trim()}.*`, $options: 'i' };
    } else if (name) {
      return res.status(400).json({ message: 'Invalid name format. Must be a string.' });
    }

    const topics = await Topic.find(query);

    if (!topics.length) {
      return res.status(404).json({ message: 'No public topics found matching the search criteria.' });
    }

    res.status(200).json({ topics });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Search Private Topic by Secret ID
const searchPrivateTopic = async (req, res) => {
  const { secretId } = req.body;

  if (!secretId || typeof secretId !== 'string') {
    return res.status(400).json({ message: 'Valid secretId is required to search private topics.' });
  }

  try {
    const topic = await Topic.findOne({ type: 'private', secretId });

    if (!topic) {
      return res.status(404).json({ message: 'No private topic found with this secret ID.' });
    }

    res.json({ topic });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Join Topic
const joinTopic = async (req, res) => {
  const { topicId } = req.body;

  try {
    const topic = await Topic.findById(topicId);

    if (!topic) {
      return res.status(404).json({ message: 'Topic not found.' });
    }

    // Check if user is already a member
    if (topic.members.includes(req.user.id)) {
      return res.status(400).json({ message: 'You are already a member of this topic.' });
    }

    // Add user to members list
    topic.members.push(req.user.id);
    await topic.save();

    res.json({ message: 'Joined topic successfully.', topic });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


// Get details of a particular topic (including number of subscribers)
const getTopicDetails = async (req, res) => {
  const { topicId } = req.params;

  try {
    const topic = await Topic.findById(topicId).populate('creator', 'name email');

    if (!topic) {
      return res.status(404).json({ message: 'Topic not found.' });
    }

    res.json({ 
      topic, 
      subscriberCount: topic.members.length 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all topics created by the authenticated user
const getMyTopics = async (req, res) => {
  try {
    const topics = await Topic.find({ creator: req.user.id });

    if (!topics.length) {
      return res.status(404).json({ message: 'No topics found.' });
    }

    res.json({ topics });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all subscribers of a particular topic created by the authenticated user
const getTopicSubscribers = async (req, res) => {
  const { topicId } = req.params;

  try {
    const topic = await Topic.findById(topicId).populate('members', 'name email');

    if (!topic) {
      return res.status(404).json({ message: 'Topic not found.' });
    }

    if (topic.creator.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized: You are not the creator of this topic.' });
    }

    res.json({ subscribers: topic.members });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all topics the authenticated user is subscribed to
const getSubscribedTopics = async (req, res) => {
  try {
    const topics = await Topic.find({ members: req.user.id });

    if (!topics.length) {
      return res.status(404).json({ message: 'No subscribed topics found.' });
    }

    res.json({ topics });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Unsubscribe from a topic
const unsubscribeFromTopic = async (req, res) => {
  const { topicId } = req.body;

  try {
    const topic = await Topic.findById(topicId);

    if (!topic) {
      return res.status(404).json({ message: 'Topic not found.' });
    }

    // Check if user is a member
    if (!topic.members.includes(req.user.id)) {
      return res.status(400).json({ message: 'You are not a member of this topic.' });
    }

    // Remove user from members list
    topic.members = topic.members.filter(memberId => memberId.toString() !== req.user.id);
    await topic.save();

    res.json({ message: 'Unsubscribed from topic successfully.', topic });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Export all functions
module.exports = {
  createTopic,
  searchTopics,
  searchPrivateTopic,
  joinTopic,
  getTopicDetails,
  getMyTopics,
  getTopicSubscribers,
  getSubscribedTopics,
  unsubscribeFromTopic
};
