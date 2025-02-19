const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Automatically set to current user
  topic: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic', required: true },
  recipients: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Subscribed users
  readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], 
  deletedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] 
// Tracks users who have read the notification
}, { timestamps: true });

module.exports = mongoose.model("Notification", notificationSchema);
