const mongoose = require("mongoose");
const Notification = require("../models/Notification");
const Topic = require("../models/Topic");

const sendNotification = async (req, res) => {
    try {
        if (!req.user || !req.user._id) {
            return res.status(401).json({ message: "Unauthorized: Missing user information" });
        }

        const sender = req.user._id;
        const { title, message, topicId } = req.body;

        const topic = await Topic.findById(topicId).populate("creator").populate("members");
        if (!topic) {
            return res.status(404).json({ message: "Topic not found" });
        }

        if (!topic.creator._id.equals(sender)) {
            return res.status(403).json({ message: "You are not authorized to send notifications for this topic." });
        }

        const recipients = topic.members.map((member) => member._id);
        const notification = new Notification({ title, message, sender, topic: topicId, recipients });
        await notification.save();

        res.status(201).json({ message: "Notification sent successfully!", notification });
    } catch (error) {
        console.error("Error sending notification:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

// Fetch all notifications
const fetchNotifications = async (req, res) => {
    try {
        const userId = req.user._id.toString();

        const notifications = await Notification.find({
            recipients: userId,
            deletedBy: { $ne: userId }, // Exclude deleted notifications
        })
        .sort({ createdAt: -1 }); // Sort by latest first

        const enrichedNotifications = notifications.map((notification) => ({
            ...notification.toObject(),
            isRead: notification.readBy.map(id => id.toString()).includes(userId),
        }));

        res.status(200).json(enrichedNotifications);
    } catch (error) {
        console.error("Error fetching notifications:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};


// Fetch specific notification by ID
const fetchNotificationById = async (req, res) => {
    try {
        const { notificationId } = req.params;
        const userId = req.user._id.toString();

        if (!mongoose.Types.ObjectId.isValid(notificationId)) {
            return res.status(400).json({ message: "Invalid notification ID" });
        }

        const notification = await Notification.findById(notificationId);
        if (!notification) {
            return res.status(404).json({ message: "Notification not found" });
        }

        if (!notification.recipients.map(id => id.toString()).includes(userId)) {
            return res.status(403).json({ message: "You are not authorized to view this notification" });
        }

        const response = {
            ...notification.toObject(),
            isRead: notification.readBy.map(id => id.toString()).includes(userId),
        };

        res.status(200).json(response);
    } catch (error) {
        console.error("Error fetching notification:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

const fetchSentNotifications = async (req, res) => {
    try {
        const userId = req.user._id.toString();

        const sentNotifications = await Notification.find({ sender: userId })
            .sort({ createdAt: -1 }); // Latest first

        res.status(200).json(sentNotifications);
    } catch (error) {
        console.error("Error fetching sent notifications:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};


// Mark notification as read
const markAsRead = async (req, res) => {
    try {
        const { notificationId } = req.params;
        const userId = req.user._id.toString();

        const notification = await Notification.findById(notificationId);
        if (!notification) {
            return res.status(404).json({ message: "Notification not found" });
        }

        if (!notification.readBy.map(id => id.toString()).includes(userId)) {
            notification.readBy.push(userId);
            await notification.save();
        }

        res.status(200).json({ message: "Notification marked as read!" });
    } catch (error) {
        console.error("Error marking notification as read:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

// Mark notification as unread
const markAsUnread = async (req, res) => {
    try {
        const { notificationId } = req.params;
        const userId = req.user._id.toString();

        const notification = await Notification.findById(notificationId);
        if (!notification) {
            return res.status(404).json({ message: "Notification not found" });
        }

        notification.readBy = notification.readBy.filter((id) => id.toString() !== userId);
        await notification.save();

        res.status(200).json({ message: "Notification marked as unread!" });
    } catch (error) {
        console.error("Error marking notification as unread:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

// Delete notification
const deleteNotification = async (req, res) => {
    try {
        const { notificationId } = req.params;
        const userId = req.user._id.toString();

        if (!mongoose.Types.ObjectId.isValid(notificationId)) {
            return res.status(400).json({ message: "Invalid notification ID" });
        }

        const notification = await Notification.findById(notificationId);
        if (!notification) {
            return res.status(404).json({ message: "Notification not found" });
        }

        if (notification.sender.toString() !== userId && !req.user.isAdmin) {
            return res.status(403).json({ message: "You do not have permission to delete this notification" });
        }

        await notification.deleteOne();
        res.status(200).json({ message: "Notification deleted successfully!" });
    } catch (error) {
        console.error("Error deleting notification:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

// Remove notification from user's inbox
const deleteNotificationFromInbox = async (req, res) => {
    try {
        const { notificationId } = req.params;
        const userId = req.user._id.toString();

        const notification = await Notification.findById(notificationId);
        if (!notification) {
            return res.status(404).json({ message: "Notification not found" });
        }

        if (!notification.recipients.map(id => id.toString()).includes(userId)) {
            return res.status(400).json({ message: "You are not a recipient of this notification" });
        }

        notification.recipients = notification.recipients.filter((recipientId) => recipientId.toString() !== userId);
        await notification.save();

        res.status(200).json({ message: "Notification removed from your inbox!" });
    } catch (error) {
        console.error("Error removing notification from inbox:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

module.exports = {
    sendNotification,
    fetchNotifications,
    fetchNotificationById,
    markAsRead,
    markAsUnread,
    deleteNotification,
    deleteNotificationFromInbox,
    fetchSentNotifications,
};
