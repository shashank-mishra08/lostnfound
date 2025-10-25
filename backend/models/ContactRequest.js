// backend/models/ContactRequest.js
// ------------------------------------------------------------
// A bridge between requester (jisne "request contact" dabaya)
// and finder (jisne FoundItem post kiya).
// ------------------------------------------------------------
const mongoose = require('mongoose');

const ContactRequestSchema = new mongoose.Schema(
  {
    foundItem: { type: mongoose.Schema.Types.ObjectId, ref: 'FoundItem', required: true },
    requester: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // who asked
    finder:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // item owner

    message:   { type: String, default: '' },          // optional note from requester
    status:    { type: String, enum: ['pending','accepted','declined'], default: 'pending' },

    // What the finder chose to share on approval (PII lives here, not always user.profile)
    sharedDetails: {
      email: { type: String, default: '' },
      phone: { type: String, default: '' },
      note:  { type: String, default: '' },            // optional extra instruction from finder
    },
  },
  { timestamps: true }
);

// Avoid duplicate open requests: one requester can have only one PENDING request per foundItem
ContactRequestSchema.index({ foundItem: 1, requester: 1, status: 1 }, { unique: true, partialFilterExpression: { status: 'pending' } });

module.exports = mongoose.model('ContactRequest', ContactRequestSchema);
