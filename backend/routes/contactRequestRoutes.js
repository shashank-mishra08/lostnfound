// backend/routes/contactRequestRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  createContactRequest,
  listReceived,
  listSent,
  approve,
  decline
} = require('../controllers/contactRequestController');

// create a new contact request for a found item
router.post('/', protect, createContactRequest);

// finder inbox (requests received on my found items)
router.get('/mine', protect, listReceived);

// requests I have sent (as requester)
router.get('/my-requests', protect, listSent);

// finder actions
router.post('/:id/approve', protect, approve);
router.post('/:id/decline', protect, decline);

module.exports = router;
