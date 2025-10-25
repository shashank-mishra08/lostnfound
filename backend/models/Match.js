// const mongoose = require('mongoose');

// const MatchSchema = new mongoose.Schema(
//   {
//     // Khoye hue item ki ID
//     lostItem: {
//       type: mongoose.Schema.Types.ObjectId,
//       required: true,
//       ref: 'LostItem',
//     },
//     // Mile hue item ki ID
//     foundItem: {
//       type: mongoose.Schema.Types.ObjectId,
//       required: true,
//       ref: 'FoundItem',
//     },
//     // "Loser" (jisne lost item post kiya) ki user ID
//     loser: {
//       type: mongoose.Schema.Types.ObjectId,
//       required: true,
//       ref: 'User',
//     },
//     // "Finder" (jisne found item post kiya) ki user ID
//     finder: {
//       type: mongoose.Schema.Types.ObjectId,
//       required: true,
//       ref: 'User',
//     },
//     // Match ka status, taaki user ispar action le sake
//     status: {
//       type: String,
//       enum: ['pending', 'accepted', 'rejected'],
//       default: 'pending',
//     },
//   },
//   {
//     timestamps: true, // Taki pata chale match kab create hua
//   }
// );

// module.exports = mongoose.model('Match', MatchSchema);

const mongoose = require('mongoose');

const MatchSchema = new mongoose.Schema(
  {
    lostItem: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'LostItem' },
    foundItem: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'FoundItem' },
    loser: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    finder: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending',
    },
    notes: { type: String } // optional, useful later
  },
  { timestamps: true }
);

// COMPOUND UNIQUE INDEX: prevents same lost+found match duplication
MatchSchema.index({ lostItem: 1, foundItem: 1 }, { unique: true });

module.exports = mongoose.model('Match', MatchSchema);