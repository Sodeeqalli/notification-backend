const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  subscribedTopics: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Topic',
    },
  ],
});

module.exports = mongoose.model('User', UserSchema);
