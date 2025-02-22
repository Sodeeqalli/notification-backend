const express = require('express');
const router = express.Router();
const authenticate = require('../middlewares/Authenticate');
const { 
    sendNotification, 
    fetchNotifications, 
    fetchNotificationById, 
    deleteNotification, 
    markAsRead,
    markAsUnread, 
    deleteNotificationFromInbox,
    fetchSentNotifications
} = require('../controllers/NotificationController');

// Endpoints
router.post('/send', authenticate, sendNotification);

// Fetch Notifications: GET /api/notifications
router.get('/', authenticate, fetchNotifications);
router.get('/sent', authenticate, fetchSentNotifications);

// Fetch Specific Notification: GET /api/notifications/:id
router.get('/:notificationId', authenticate, fetchNotificationById);

// Delete Notification: DELETE /api/notifications/:id
router.delete('/:notificationId', authenticate, deleteNotification);

router.patch('/:notificationId/mark-as-read', authenticate, markAsRead);

router.patch('/:notificationId/mark-as-unread', authenticate, markAsUnread);

router.patch('/:notificationId/delete-from-inbox', authenticate, deleteNotificationFromInbox);

// Fetch notifications sent by the authenticated user



module.exports = router;
