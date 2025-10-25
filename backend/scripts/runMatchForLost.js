/**
 * backend/scripts/runMatchForLost.js
 * Usage: node backend/scripts/runMatchForLost.js <LOST_ITEM_ID>
 *
 * Simple one-shot script: connect DB, load LostItem, run matching logic,
 * and print logs. (Isse pata chalega agar potential matches milte hain.)
 */

const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.resolve(__dirname, '../.env') }); // load .env from backend root

// connect DB (reuse your existing connect function)
const connectDB = require('../config/database'); // ensure this path is correct
const LostItem = require('../models/LostItems') || require('../models/LostItem'); // try both names
const FoundItem = require('../models/FoundItem');
const Match = require('../models/Match');

async function findMatchesForLostItem(lostItem) {
  console.log('Finding matches for:', lostItem.itemName);
  try {
    const sevenDays = 7 * 24 * 60 * 60 * 1000;
    const lostDate = new Date(lostItem.lostDate || lostItem.createdAt || Date.now());
    const startDate = new Date(lostDate.getTime() - sevenDays);
    const endDate = new Date(lostDate.getTime() + sevenDays);

    console.log('Searching FoundItems with category:', lostItem.category, 'date between', startDate, 'and', endDate);

    const potentialMatches = await FoundItem.find({
      category: lostItem.category,
      foundDate: { $gte: startDate, $lte: endDate },
      itemName: { $regex: lostItem.itemName, $options: 'i' }
    });

    console.log('Potential matches count =', potentialMatches.length);

    if (!potentialMatches || potentialMatches.length === 0) {
      console.log('No potential matches found for item ID', lostItem._id.toString());
      return [];
    }

    const created = [];
    for (const found of potentialMatches) {
      try {
        // check existing
        const exists = await Match.findOne({ lostItem: lostItem._id, foundItem: found._id });
        if (exists) {
          console.log('Skip - match already exists:', exists._id.toString());
          continue;
        }
        const m = await Match.create({
          lostItem: lostItem._id,
          foundItem: found._id,
          loser: lostItem.owner,
          finder: found.finder || null,
        });
        console.log('Created match id:', m._id.toString());
        created.push(m);
      } catch (err) {
        if (err.code === 11000) {
          console.warn('Duplicate prevented by DB index (race).');
        } else {
          console.error('Error creating match for found._id', found._id.toString(), err.message || err);
        }
      }
    }
    return created;
  } catch (err) {
    console.error('Error in matching function:', err);
    return [];
  }
}

(async () => {
  try {
    await connectDB();
    const lostId = process.argv[2];
    if (!lostId) {
      console.error('Usage: node runMatchForLost.js <LOST_ITEM_ID>');
      process.exit(1);
    }
    // try both possible model export names
    const lost = await LostItem.findById(lostId).lean();
    if (!lost) {
      console.error('Lost item not found:', lostId);
      process.exit(1);
    }
    console.log('Loaded lost item:', lost._id.toString(), lost.itemName);
    const res = await findMatchesForLostItem(lost);
    console.log('Finished. Matches created:', res.length);
    process.exit(0);
  } catch (err) {
    console.error('Fatal error running script:', err);
    process.exit(1);
  }
})();
