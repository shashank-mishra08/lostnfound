// backend/controllers/notification-controller.js
const Notification = require('../models/Notification');

// GET /api/notifications  (protected)
exports.listMyNotifications = async (req, res) => {
  try {
    const docs = await Notification.find({ user: req.user.id })
      .sort({ read: 1, createdAt: -1 })
      .limit(200);
    res.json(docs);
  } catch (e) {
    console.error('notifications list error:', e);
    res.status(500).json({ message: 'Failed to fetch notifications' });
  }
};

// PATCH /api/notifications/:id  (protected)
exports.markOneRead = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await Notification.findOneAndUpdate(
      { _id: id, user: req.user.id },
      { $set: { read: true } },
      { new: true }
    );
    if (!doc) return res.status(404).json({ message: 'Notification not found' });
    res.json(doc);
  } catch (e) {
    console.error('notifications markOne error:', e);
    res.status(500).json({ message: 'Failed to mark read' });
  }
};

// PATCH /api/notifications/read-all/all  (protected)
exports.markAllRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user.id, read: false },
      { $set: { read: true } }
    );
    res.json({ ok: true });
  } catch (e) {
    console.error('notifications markAll error:', e);
    res.status(500).json({ message: 'Failed to mark all read' });
  }
};
