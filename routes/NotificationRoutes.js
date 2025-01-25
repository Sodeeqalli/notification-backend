const express = require('express');
const router = express.Router();
const authenticate = require('../middlewares/Authenticate');
const { 
    sendNotification, 
    fetchNotifications, 
    deleteNotification, 
    markAsRead,
    markAsUnread, 
    deleteNotificationFromInbox
} = require('../controllers/NotificationController');

// Endpoints
router.post('/send', authenticate, sendNotification);

// Fetch Notifications: GET /api/notifications
router.get('/', authenticate, fetchNotifications);

// Delete Notification: DELETE /api/notifications/:id
router.delete('/:id', authenticate, deleteNotification);

router.patch('/:notificationId/mark-as-read', authenticate, markAsRead);

router.patch('/:notificationId/mark-as-unread', authenticate, markAsUnread);

router.patch('/:notificationId/delete-from-inbox', authenticate, deleteNotificationFromInbox);


module.exports = router;
