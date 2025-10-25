const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  listMyNotifications,
  markOneRead,
  markAllRead
} = require('../controllers/notification-controller');

console.log('notification-route.js loaded'); // Add this line

router.get('/', protect, listMyNotifications);
router.patch('/:id', protect, markOneRead);
router.patch('/read-all/all', protect, markAllRead); // simple path to avoid id collision

module.exports = router;
