const Match = require('../models/Match');
const LostItem = require('../models/LostItems');
const FoundItem = require('../models/FoundItem');
const Notification = require('../models/Notification'); 

// Helper: non-blocking notification creation (we don't block main flow on notification failures)
async function createNotification(userId, title, message, data = {}) {
  try {
    // Notification model schema assumed: { user, title, message, data, read }
    await Notification.create({
      user: userId,
      title,
      message,
      data,
    });
  } catch (err) {
    console.warn('createNotification failed for', userId, err?.message || err);
  }
}

/**
 * GET /api/matches/lost/:lostId
 * - Returns matches for a lost item
 * - Only owner of lost item (loser) can call this (protect middleware must be applied in route)
 */
const getMatchesForLostItem = async (req, res, next) => {
  try {
    const { lostId } = req.params;
    console.log('getMatchesForLostItem: lostId =', lostId);

    // fetch lost item to validate ownership
    const lost = await LostItem.findById(lostId);
    console.log('getMatchesForLostItem: fetched lost item =', lost);
    if (!lost) {
      res.status(404);
      return next(new Error('Lost item not found'));
    }

    // only owner can see matches for their lost item
    console.log('getMatchesForLostItem: req.user.id =', req.user.id);
    console.log('getMatchesForLostItem: lost.owner =', lost.owner.toString());
    if (lost.owner.toString() !== req.user.id) {
      res.status(401);
      return next(new Error('Not authorized to view matches for this item'));
    }

    // find matches and populate minimal info for UI
    const matches = await Match.find({ lostItem: lostId })
      .populate({
        path: 'foundItem',
        select: 'itemName description category foundDate foundLocation image status',
      })
      .populate({
        path: 'finder',
        select: 'name email',
      })
      .sort({ createdAt: -1 });

    return res.status(200).json(matches);
  } catch (err) {
    console.error('getMatchesForLostItem error', err);
    next(err);
  }
};

/**
 * POST /api/matches/:matchId/verify
 * Body: { secretIdentifier }
 * Flow:
 *  - Verify requestor is owner of lost item
 *  - Compare secretIdentifier
 *  - If matches: set lost.status='reclaimed', found.status='returned', match.status='accepted'
 *               create notifications for both sides
 *  - If not: mark match.status='rejected' and notify finder
 */
const verifyMatch = async (req, res, next) => {
  try {
    const { matchId } = req.params;
    const { secretIdentifier } = req.body;

    if (!secretIdentifier || !secretIdentifier.toString().trim()) {
      res.status(400);
      return next(new Error('Please provide secretIdentifier'));
    }

    // populate lostItem & foundItem & finder
    const match = await Match.findById(matchId)
      .populate({ path: 'lostItem', select: 'itemName secretIdentifier owner status' })
      .populate({ path: 'foundItem', select: 'itemName finder status' })
      .populate({ path: 'finder', select: 'name email' });

    if (!match) {
      res.status(404);
      return next(new Error('Match not found'));
    }

    // ownership check: only owner (loser) can verify
    if (!match.lostItem) {
      res.status(500);
      return next(new Error('Lost item not populated in match'));
    }
    if (match.lostItem.owner.toString() !== req.user.id) {
      res.status(401);
      return next(new Error('Only the owner can verify this match'));
    }

    // disallow re-verifying a non-pending match
    if (match.status === 'accepted') {
      return res.status(400).json({ message: 'This match is already accepted' });
    }
    if (match.status === 'rejected') {
      return res.status(400).json({ message: 'This match is already rejected' });
    }

    // normalize and compare
    const expected = (match.lostItem.secretIdentifier || '').toString().trim().toLowerCase();
    const provided = secretIdentifier.toString().trim().toLowerCase();

    if (expected === provided) {
      // === SUCCESS ===
      // update statuses on items
      await LostItem.findByIdAndUpdate(match.lostItem._id, { status: 'reclaimed' });
      if (match.foundItem && match.foundItem._id) {
        await FoundItem.findByIdAndUpdate(match.foundItem._id, { status: 'returned' });
      }

      // update match status
      match.status = 'accepted';
      await match.save();

      // create in-app notifications (best-effort)
      try {
        // owner (loser)
        await createNotification(match.lostItem.owner,
          `Match accepted for "${match.lostItem.itemName}"`,
          `You accepted a match. The lost item is now marked as reclaimed.`,
          { matchId: match._id.toString(), lostItem: match.lostItem._id.toString() });

        // finder (person who reported found item)
        const finderId = match.finder ? match.finder._id : (match.foundItem && match.foundItem.finder);
        if (finderId) {
          await createNotification(finderId,
            `A match was accepted for your found item "${match.foundItem.itemName}"`,
            `The owner verified the match. Please coordinate to return the item.`,
            { matchId: match._id.toString(), foundItem: match.foundItem._id.toString() });
        }
      } catch (nerr) {
        console.warn('Notification creation issue', nerr?.message || nerr);
      }

      return res.status(200).json({ message: 'Match accepted successfully', match });
    } else {
      // === MISMATCH ===
      match.status = 'rejected';
      await match.save();

      // notify finder that owner rejected
      try {
        const finderId = match.finder ? match.finder._id : (match.foundItem && match.foundItem.finder);
        if (finderId) {
          await createNotification(finderId,
            `Match rejected for "${match.foundItem.itemName}"`,
            `Owner checked the match and said it is not a match.`,
            { matchId: match._id.toString(), foundItem: match.foundItem._id.toString() });
        }
      } catch (nerr) { /* ignore */ }

      return res.status(400).json({ message: 'Secret identifier did not match. Match rejected.' });
    }
  } catch (err) {
    console.error('verifyMatch error', err);
    next(err);
  }
};


/**
 * POST /api/matches/:matchId/reject
 * Owner-only (lost item ka owner hi reject kar sakta)
 * Body: { reason?: string }
 * Flow:
 *  - Match fetch + ownership check
 *  - Agar already accepted/rejected -> 400
 *  - status = 'rejected'
 *  - Finder ko notification
 *  - Updated match return
 */
const rejectMatch = async (req, res, next) => {
  try {
    const { matchId } = req.params;
    const { reason = '' } = req.body || {};

    // match + related docs populate (finder notify ke liye)
    const match = await Match.findById(matchId)
      .populate({ path: 'lostItem', select: 'itemName owner status' })
      .populate({ path: 'foundItem', select: 'itemName finder status' })
      .populate({ path: 'finder', select: 'name email' });

    if (!match) {
      res.status(404);
      return next(new Error('Match not found'));
    }

    // owner-only guard
    if (!match.lostItem) {
      res.status(500);
      return next(new Error('Lost item not populated in match'));
    }
    if (match.lostItem.owner.toString() !== req.user.id) {
      res.status(401);
      return next(new Error('Only the owner can reject this match'));
    }

    // double action guards
    if (match.status === 'accepted') {
      return res.status(400).json({ message: 'This match is already accepted' });
    }
    if (match.status === 'rejected') {
      return res.status(400).json({ message: 'This match is already rejected' });
    }

    // update status
    match.status = 'rejected';
    await match.save();

    // best-effort notification to finder
    try {
      const finderId = match.finder ? match.finder._id : (match.foundItem && match.foundItem.finder);
      if (finderId) {
        await createNotification(
          finderId,
          `Match rejected for "${match.foundItem?.itemName || 'item'}"`,
          reason
            ? `Owner rejected the match. Reason: ${reason}`
            : `Owner rejected the match.`,
          { matchId: match._id.toString(), foundItem: match.foundItem?._id?.toString() }
        );
      }
    } catch (nerr) {
      console.warn('Notification creation issue (reject)', nerr?.message || nerr);
    }

    return res.status(200).json({ message: 'Match rejected', match });
  } catch (err) {
    console.error('rejectMatch error', err);
    next(err);
  }
};



// add inside backend/controllers/matchController.js
// -------------------------------------------
// Get matches for the logged-in user (both roles: loser(owner) and finder)
// Route: GET /api/matches/me
// Access: Private (protect middleware)
// We return matches with populated lostItem/foundItem and the other user info
// -------------------------------------------
const getMyMatches = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // find matches where user is either loser (owner of lost item) OR finder (reported found item)
    const matches = await Match.find({
      $or: [{ loser: userId }, { finder: userId }]
    })
      .populate({
        path: 'lostItem',
        select: 'itemName lostDate lostLocation image owner secretIdentifier status'
      })
      .populate({
        path: 'foundItem',
        select: 'itemName foundDate foundLocation image finder status'
      })
      .populate({
        path: 'finder',
        select: 'name email'
      })
      .sort({ createdAt: -1 });

    // Map to friendly shape for frontend
    const payload = matches.map(m => ({
      _id: m._id,
      status: m.status,
      createdAt: m.createdAt,
      updatedAt: m.updatedAt,
      role: m.loser.toString() === userId ? 'owner' : 'finder', // user's role in this match
      lostItem: m.lostItem ? {
        _id: m.lostItem._id,
        itemName: m.lostItem.itemName,
        image: m.lostItem.image,
        status: m.lostItem.status,
        owner: m.lostItem.owner
      } : null,
      foundItem: m.foundItem ? {
        _id: m.foundItem._id,
        itemName: m.foundItem.itemName,
        image: m.foundItem.image,
        status: m.foundItem.status,
        finder: m.foundItem.finder
      } : null,
      otherUser: m.loser.toString() === userId ? (m.finder ? { _id: m.finder._id, name: m.finder.name } : null)
                                               : (m.lostItem && m.lostItem.owner ? { _id: m.lostItem.owner } : null)
    }));

    return res.status(200).json(payload);
  } catch (err) {
    console.error('getMyMatches error', err);
    next(err);
  }
};

module.exports = {
    getMatchesForLostItem,
    verifyMatch,
    getMyMatches,
    rejectMatch,
};