// backend/models/Notification.js
// ------------------------------------------------------------
// Simple notification model:
// - user: jiske liye notification hai
// - type: 'match_created' | 'match_verified' | 'match_rejected' (future: 'message', etc.)
// - message: short text to show in UI
// - meta: lightweight refs (matchId, lostId, foundId) for deep-link
// - read: read/unread flag
// ------------------------------------------------------------
const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, required: true }, // 'match_created' | 'match_verified' | 'match_rejected'
    message: { type: String, required: true },
    meta: {
      matchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Match' },
      lostId:  { type: mongoose.Schema.Types.ObjectId, ref: 'LostItem' },
      foundId: { type: mongoose.Schema.Types.ObjectId, ref: 'FoundItem' },
    },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Helpful index: unread first + latest first
NotificationSchema.index({ user: 1, read: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', NotificationSchema);
