const mongoose = require('mongoose');

const LostItemSchema = new mongoose.Schema(
  {
    // Ye field batayega ki is item ka maalik kaun hai.
    // 'ref: 'User'' se ye User model se jud jayega.
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    itemName: {
      type: String,
      required: [true, 'Please add an item name'],
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
    },
    category: {
      type: String,
      required: [true, 'Please select a category'],
    },
    // Ye private nishaan hai, jo sirf maalik ko pata hoga.
    secretIdentifier: {
      type: String,
      required: [true, 'Please add a secret identifying mark'],
    },
    lostDate: {
      type: Date,
      required: true,
    },
    lostLocation: {
      address: {
        type: String,
        required: [true, 'Please add a location'],
      },
      // Hum baad me yahan map ke coordinates bhi add kar sakte hain.
    },
    // Image ka URL store karne ke liye. Actual image upload baad me handle karenge.
    image: {
      type: String,
    },
    // Item ka current status.
    status: {
      type: String,
      required: true,
      enum: ['lost', 'reclaimed'],
      default: 'lost',
    },
  },
  {
    timestamps: true, // `createdAt` aur `updatedAt` fields ke liye
  }
);

LostItemSchema.index({ itemName: 'text', description: 'text' });

module.exports = mongoose.model('LostItem', LostItemSchema);