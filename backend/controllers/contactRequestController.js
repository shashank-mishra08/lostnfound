// backend/controllers/contactRequestController.js
// ------------------------------------------------------------
// Routes implemented:
//  POST   /api/contact-requests           -> create request (any logged-in user)
//  GET    /api/contact-requests/mine      -> requests that I (finder) have received on my found items
//  GET    /api/contact-requests/my-requests -> requests I have sent (requester view)
//  POST   /api/contact-requests/:id/approve -> finder approves; shares contact
//  POST   /api/contact-requests/:id/decline -> finder declines
// ------------------------------------------------------------
const ContactRequest = require('../models/ContactRequest');
const FoundItem = require('../models/FoundItem');
const Notification = require('../models/Notification'); // we will write directly

// Small helper: best-effort notification (non-blocking failures)
async function notify(user, title, message, data = {}) {
  try {
    await Notification.create({ user, title, message, data });
  } catch (e) {
    console.warn('[contact] notify failed:', e.message);
  }
}

// POST /api/contact-requests
// Body: { foundItemId, message? }
exports.createContactRequest = async (req, res) => {
  try {
    const { foundItemId, message } = req.body;
    if (!foundItemId) return res.status(400).json({ message: 'foundItemId required' });

    // Ensure found item exists
    const found = await FoundItem.findById(foundItemId).select('finder itemName');
    if (!found) return res.status(404).json({ message: 'Found item not found' });

    // Self-request guard: finder cannot request themselves
    if (String(found.finder) === req.user.id) {
      return res.status(400).json({ message: 'You cannot request contact on your own found item' });
    }

    // Create pending request
    const doc = await ContactRequest.create({
      foundItem: found._id,
      requester: req.user.id,
      finder: found.finder,
      message: (message || '').toString(),
    });

    // Notify finder
    await notify(
      found.finder,
      'New contact request',
      `Someone requested your contact for "${found.itemName}".`,
      { contactRequestId: doc._id, foundItem: found._id }
    );

    res.status(201).json({ message: 'Request sent', request: doc });
  } catch (e) {
    // duplicate pending request will throw duplicate key error (index)
    if (e?.code === 11000) {
      return res.status(409).json({ message: 'You already have a pending request for this item' });
    }
    console.error('createContactRequest error:', e);
    res.status(500).json({ message: 'Failed to create contact request' });
  }
};

// GET /api/contact-requests/mine  (finder inbox)
exports.listReceived = async (req, res) => {
  try {
    const rows = await ContactRequest.find({ finder: req.user.id })
      .populate({ path: 'foundItem', select: 'itemName image foundDate' })
      .populate({ path: 'requester', select: 'name email' })
      .sort({ createdAt: -1 });
    res.json(rows);
  } catch (e) {
    console.error('listReceived error:', e);
    res.status(500).json({ message: 'Failed to fetch requests' });
  }
};

// GET /api/contact-requests/my-requests  (as requester)
exports.listSent = async (req, res) => {
  try {
    const rows = await ContactRequest.find({ requester: req.user.id })
      .populate({ path: 'foundItem', select: 'itemName image foundDate finder' })
      .populate({ path: 'finder', select: 'name' })
      .sort({ createdAt: -1 });
    res.json(rows);
  } catch (e) {
    console.error('listSent error:', e);
    res.status(500).json({ message: 'Failed to fetch my requests' });
  }
};

// POST /api/contact-requests/:id/approve
// Body: { email?, phone?, note? } -> finder decides what to share
exports.approve = async (req, res) => {
  try {
    const { id } = req.params;
    const { email = '', phone = '', note = '' } = req.body || {};

    const doc = await ContactRequest.findById(id).populate('foundItem requester finder');
    if (!doc) return res.status(404).json({ message: 'Request not found' });

    // Only the finder can approve/decline
    if (String(doc.finder._id) !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized to approve this request' });
    }

    if (doc.status !== 'pending') {
      return res.status(400).json({ message: `Request already ${doc.status}` });
    }

    doc.status = 'accepted';
    doc.sharedDetails = {
      email: email || (doc.finder.email || ''), // default: profile email if any
      phone: phone || (doc.finder.phone || ''), // phone may not exist on profile
      note,
    };
    await doc.save();

    // Notify requester with contact details (will be displayed in UI)
    await notify(
      doc.requester._id,
      'Contact approved',
      `Finder shared contact for "${doc.foundItem.itemName}".`,
      {
        contactRequestId: doc._id,
        foundItem: doc.foundItem._id,
        contact: doc.sharedDetails, // {email, phone, note}
      }
    );

    res.json({ message: 'Approved and shared details', request: doc });
  } catch (e) {
    console.error('approve contact error:', e);
    res.status(500).json({ message: 'Failed to approve request' });
  }
};

// POST /api/contact-requests/:id/decline
exports.decline = async (req, res) => {
  try {
    const { id } = req.params;

    const doc = await ContactRequest.findById(id).populate('foundItem requester finder');
    if (!doc) return res.status(404).json({ message: 'Request not found' });

    if (String(doc.finder._id) !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized to decline this request' });
    }

    if (doc.status !== 'pending') {
      return res.status(400).json({ message: `Request already ${doc.status}` });
    }

    doc.status = 'declined';
    await doc.save();

    // Notify requester politely
    await notify(
      doc.requester._id,
      'Contact request declined',
      `Finder declined your contact request for "${doc.foundItem.itemName}".`,
      { contactRequestId: doc._id, foundItem: doc.foundItem._id }
    );

    res.json({ message: 'Declined', request: doc });
  } catch (e) {
    console.error('decline contact error:', e);
    res.status(500).json({ message: 'Failed to decline request' });
  }
};
