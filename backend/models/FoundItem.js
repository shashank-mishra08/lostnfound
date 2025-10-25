const mongoose = require('mongoose');

const FoundItemSchema = new mongoose.Schema(
  {
    // Ye field batayega ki is item ko kisne dhoondha hai.
    finder: {
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
    // Dhyan dein: Yahan 'secretIdentifier' nahi hai, kyunki wo sirf asli maalik ko pata hota hai.
    foundDate: {
      type: Date,
      required: true,
    },
    foundLocation: {
      address: {
        type: String,
        required: [true, 'Please add a location'],
      },
    },
    image: {
      type: String,
    },
    status: {
      type: String,
      required: true,
      enum: ['found', 'returned'],
      default: 'found',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('FoundItem', FoundItemSchema);