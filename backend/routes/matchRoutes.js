// backend/routes/matchRoutes.js
// Routes to list matches for a lost item and to verify a match.

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware'); // ensure this middleware exists
const { getMatchesForLostItem, verifyMatch, getMyMatches, rejectMatch } = require('../controllers/matchController');

// GET matches for a lost item (owner only)
router.get('/lost/:lostId', protect, getMatchesForLostItem);

// POST verify a match (owner-only)
router.post('/:matchId/verify', protect, verifyMatch);
// NEW: get all matches where current user is owner or finder
router.get('/me', protect, getMyMatches);
router.post('/:matchId/reject', protect, rejectMatch); // ✅ NEW: clean reject endpoint
module.exports = router;