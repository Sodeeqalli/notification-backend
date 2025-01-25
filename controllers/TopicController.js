const Topic = require('../models/Topic'); // Import Topic model

// Create Topic
const createTopic = async (req, res) => {
  const { name, description, type, secretId } = req.body;

  if (!name || !type) {
    return res.status(400).json({ message: 'Name and type are required.' });
  }

  try {
    const topicExists = await Topic.findOne({ name });
    if (topicExists) {
      return res.status(400).json({ message: 'Topic with this name already exists.' });
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

const searchTopics = async (req, res) => {
  try {
    const { name } = req.body; // Use req.body to get the input name

    // Start with public topics as the base query
    const query = { type: 'public' };

    // Add name filter if provided and valid
    if (name && typeof name === 'string' && name.trim() !== '') {
      query.name = { $regex: `.*${name.trim()}.*`, $options: 'i' }; // Case-insensitive partial match
    }

    console.log('Constructed Query:', query); // Debugging log

    // Perform the database search
    const topics = await Topic.find(query);

    // Handle cases where no topics match
    if (!topics.length) {
      return res.status(404).json({ message: 'No public topics found matching the search criteria.' });
    }

    // Return matching topics
    res.status(200).json({ topics });
  } catch (error) {
    console.error('Error during topic search:', error); // Debugging log
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};





  
// Search Private Topic by Secret ID
const searchPrivateTopic = async (req, res) => {
  const { secretId } = req.body;

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

// Export all functions
module.exports = {
  createTopic,
  searchTopics,
  searchPrivateTopic,
  joinTopic,
};
