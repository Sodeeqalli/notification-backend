const Notification = require('../models/Notification'); 
const Topic = require('../models/Topic')

const sendNotification = async (req, res) => {
    try {
        if (!req.user || !req.user._id) {
            return res.status(401).json({ message: 'Unauthorized: Missing user information' });
        }

        const sender = req.user._id;
        console.log('Sender ID:', sender); // Confirm it's not undefined

        const { title, message, topicId } = req.body;

        const topic = await Topic.findById(topicId).populate('creator').populate('members');
        if (!topic) {
            return res.status(404).json({ message: 'Topic not found' });
        }

        console.log('Topic Creator ID:', topic.creator._id);
        console.log('Is Sender Authorized:', topic.creator._id.equals(sender));

        if (!topic.creator._id.equals(sender)) {
            return res.status(403).json({ message: 'You are not authorized to send notifications for this topic.' });
        }

        const recipients = topic.members.map(member => member._id);
        const notification = new Notification({ title, message, sender, topic: topicId, recipients });
        await notification.save();

        res.status(201).json({ message: 'Notification sent successfully!', notification });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};






// Fetch Notifications
const fetchNotifications = async (req, res) => {
    try {
        const userId = req.user._id;

        // Retrieve notifications for the user, excluding those marked as deleted by the user
        const notifications = await Notification.find({
            recipients: userId,
            deletedBy: { $ne: userId },
        });

        // Add a `isRead` field for each notification
        const enrichedNotifications = notifications.map(notification => ({
            ...notification._doc,
            isRead: notification.readBy.includes(userId),
        }));

        res.status(200).json(enrichedNotifications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



// Mark Notification as Read
const markAsRead = async (req, res) => {
    try {
        const { notificationId } = req.params;
        const userId = req.user._id;

        const notification = await Notification.findById(notificationId);
        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        if (!notification.readBy.includes(userId)) {
            notification.readBy.push(userId);
            await notification.save();
        }

        res.status(200).json({ message: 'Notification marked as read!' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Mark Notification as Unread
const markAsUnread = async (req, res) => {
    try {
        const { notificationId } = req.params;
        const userId = req.user._id;

        const notification = await Notification.findById(notificationId);
        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        notification.readBy = notification.readBy.filter(id => id.toString() !== userId.toString());
        await notification.save();

        res.status(200).json({ message: 'Notification marked as unread!' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete Notification
const deleteNotification = async (req, res) => {
    try {
        const { notificationId } = req.params;
        const userId = req.user._id;

        const notification = await Notification.findById(notificationId);
        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        if (notification.sender.toString() !== userId.toString() && !req.user.isAdmin) {
            return res.status(403).json({ message: 'You do not have permission to delete this notification' });
        }

        await notification.deleteOne();
        res.status(200).json({ message: 'Notification deleted successfully!' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
const deleteNotificationFromInbox = async (req, res) => {
    try {
        const { notificationId } = req.params;
        const userId = req.user._id;

        const notification = await Notification.findById(notificationId);
        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        // Check if the user is a recipient
        if (!notification.recipients.includes(userId)) {
            return res.status(400).json({ message: 'You are not a recipient of this notification' });
        }

        // Remove the user from the recipients array
        notification.recipients = notification.recipients.filter(
            recipientId => recipientId.toString() !== userId.toString()
        );

        await notification.save();

        res.status(200).json({ message: 'Notification removed from your inbox!' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



module.exports = {
    sendNotification,
    fetchNotifications,
    markAsRead,
    markAsUnread,
    deleteNotification,
    deleteNotificationFromInbox
};