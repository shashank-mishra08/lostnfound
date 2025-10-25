
const User = require('../models/user'); // Iski zaroorat shayad aage pade
const FoundItem = require('../models/FoundItem'); // Naye model ko import karein
const LostItem = require('../models/LostItems');
const Match = require('../models/Match'); // Match model ko bhi import kareinz
const fs = require('fs');
const path = require('path');
const { escapeRegex } = require('../utils/regex')
const Notification = require('../models/Notification');

// Helper to remove file if it exists
const removeFileIfExists = async (filePath) => {
  const fullPath = path.join(__dirname, '..', filePath);
  try {
    await fs.promises.access(fullPath);
    await fs.promises.unlink(fullPath);
    console.log(`Successfully deleted old image: ${fullPath}`);
  } catch (error) {
    // file doesn't exist or other error, just log it
    if (error.code !== 'ENOENT') {
      console.error(`Error deleting old image ${fullPath}:`, error);
    }
  }
};


const findMatchesForLostItem = async (lostItem) => {
  console.log('Finding matches for:', lostItem.itemName);

  try {
    // 7 din ka time frame
    const sevenDays = 7 * 24 * 60 * 60 * 1000;
    const lostDate = new Date(lostItem.lostDate || lostItem.createdAt || Date.now());

    const startDate = new Date(lostDate.getTime() - sevenDays);
    const endDate = new Date(lostDate.getTime() + sevenDays);

    // basic search: same category, date range, name regex (case-insensitive)
    const potentialMatches = await FoundItem.find({
      category: lostItem.category,
      foundDate: { $gte: startDate, $lte: endDate },
      itemName: { $regex: lostItem.itemName, $options: 'i' },
    });

    if (!potentialMatches || potentialMatches.length === 0) {
      console.log(`ℹ️ No potential matches found for item ID ${lostItem._id}`);
      return [];
    }

    console.log(`✅ ${potentialMatches.length} potential found items. Processing...`);

    const createdMatches = [];

    for (const found of potentialMatches) {
      try {
        // check if match already exists (prevents duplicates)
        const existing = await Match.findOne({ lostItem: lostItem._id, foundItem: found._id });
        if (existing) {
          console.log('Skip - match already exists:', existing._id.toString());
          continue;
        }

        // create match doc
        const m = await Match.create({
          lostItem: lostItem._id,
          foundItem: found._id,
          loser: lostItem.owner,
          finder: found.finder || null, // fallback if not present
        });
           const notifPayload = {
              type: 'match_created',
              message: `New match found for "${lostItem.itemName}"`,
              meta: { matchId: m._id, lostId: m.lostItem, foundId: m.foundItem },
            };
  try {
    if (m.loser) await Notification.create({ user: m.loser, ...notifPayload });
    if (m.finder) {
      await Notification.create({
        user: m.finder,
        type: 'match_created',
        message: `Your found item may match "${lostItem.itemName}"`,
        meta: { matchId: m._id, lostId: m.lostItem, foundId: m.foundItem },
      });
    }
  } catch (e) {
    console.warn('Notification create failed (match_created):', e.message);
  }

        console.log('Match created:', m._id.toString());
        createdMatches.push(m);
      } catch (matchError) {
        // If unique index race occurs, it throws code 11000; ignore it.
        if (matchError && matchError.code === 11000) {
          console.warn('Duplicate match prevented by DB index (race):', matchError.message);
        } else {
          console.error('Error creating match for found item', found._id, matchError);
        }
      }
    }

    return createdMatches;
  } catch (error) {
    console.error('Error while finding matches and saving:', error);
    return [];
  }
};


// controller file me hi (yahin jahan findMatchesForLostItem hai)
// ------------------------------------------------------------
// Found item create hone ke baad purane Lost items par match banane ke liye
// same rules: category same, date window ±7 din, name partial match (case-insensitive).
// Duplicate guard bhi rakhenge.
// ------------------------------------------------------------


const findMatchesForFoundItem = async (foundItem) => {
  console.log('Finding matches for FOUND:', foundItem.itemName);

  try {
    const sevenDays = 7 * 24 * 60 * 60 * 1000;
    const foundDate = new Date(foundItem.foundDate || foundItem.createdAt || Date.now());

    const startDate = new Date(foundDate.getTime() - sevenDays);
    const endDate   = new Date(foundDate.getTime() + sevenDays);

    // safer regex: escape user input first
    const safeName = escapeRegex(foundItem.itemName);

    // LostItems jo is Found se mil sakte
    const potentialLost = await LostItem.find({
      category: foundItem.category,
      lostDate: { $gte: startDate, $lte: endDate },
      itemName: { $regex: safeName, $options: 'i' }, // "chasma" ~ "black chasma"
    });

    if (!potentialLost || potentialLost.length === 0) {
      console.log(`ℹ️ No potential lost matches for found ID ${foundItem._id}`);
      return [];
    }

    console.log(`✅ ${potentialLost.length} potential LOST items. Processing...`);

    const createdMatches = [];

    for (const lost of potentialLost) {
      try {
        // duplicate guard
        const existing = await Match.findOne({ lostItem: lost._id, foundItem: foundItem._id });
        if (existing) {
          console.log('Skip - match already exists:', existing._id.toString());
          continue;
        }

        const m = await Match.create({
          lostItem: lost._id,
          foundItem: foundItem._id,
          loser: lost.owner,
          finder: foundItem.finder || null,
        });
        const notifPayload = {
          type: 'match_created',
          message: `New match found for "${lost.itemName}"`,
          meta: { matchId: m._id, lostId: m.lostItem, foundId: m.foundItem },
       };
         try {
         if (m.loser) await Notification.create({ user: m.loser, ...notifPayload });
         if (m.finder) {
         await Notification.create({
        user: m.finder,
        type: 'match_created',
        message: `Your found item may match "${lost.itemName}"`,
        meta: { matchId: m._id, lostId: m.lostItem, foundId: m.foundItem },
      });
    }
  } catch (e) {
    console.warn('Notification create failed (match_created):', e.message);
  }

        console.log('Match created (from FOUND):', m._id.toString());
        createdMatches.push(m);
      } catch (err) {
        if (err && err.code === 11000) {
          console.warn('Duplicate prevented by index (race):', err.message);
        } else {
          console.error('Error creating match for lost item', lost._id, err);
        }
      }
    }

    return createdMatches;
  } catch (error) {
    console.error('Error while reverse matching (Found→Lost):', error);
    return [];
  }
};

            


//=================================================================
//                      LOST ITEM CONTROLLER
//                         @desc    Post a new lost item
//                         @route   POST /api/items/lost
//                         @access  Private
//=================================================================

const postLostItem = async (req, res, next) => {
  try {
    // Debug: Log the received data
    console.log("Received req.body:", req.body);
    console.log("Received req.file:", req.file);

    // --------- NEW: handle file ---------
    let imagePath = null;
    if (req.file) {
      imagePath = `uploads/images/${req.file.filename}`;
    }

    // Handle field mapping for lost items
    const {
      itemName,
      description,
      category,
      secretIdentifier,
      lostDate,
      lostLocation, // This is now a JSON string
    } = req.body;

    let parsedLocation;
    try {
      parsedLocation = JSON.parse(lostLocation);
    } catch (error) {
      return res.status(400).json({ message: 'Invalid location format. Expected a JSON string.', error: error.message });
    }

    // --------- build object manually ---------
    const lostItemData = {
      itemName,
      description,
      category,
      secretIdentifier,
      lostDate,
      lostLocation: parsedLocation,
      owner: req.user.id,    // owner set from auth
      image: imagePath,      // <-- image ko string path me store karna
    };

    console.log("Data for lost item creation:", lostItemData);
    const lostItem = await LostItem.create(lostItemData);

    // ITEM CREATE HONE KE BAAD, MATCHES DHOONDHO
    try {
      const matches = await findMatchesForLostItem(lostItem);
      if (matches && Array.isArray(matches) && matches.length > 0) {
        console.log(`✅ Found ${matches.length} potential match(es) for item ID ${lostItem._id}`);
        console.log(matches);
      } else {
        console.log(`ℹ️ No potential matches found for item ID ${lostItem._id}`);
      }
    } catch (matchError) {
      console.error('Error in match finding process:', matchError);
      // Continue with the response even if match finding fails
    }

    res.status(201).json(lostItem);
  } catch (error) {
    console.error("ERROR IN postLostItem:", error);
    res.status(500).json({ message: 'Error creating lost item.', error: error.message, stack: error.stack });
  }
};


//================================================================================
//                      FOUND ITEM CONTROLLER
//                               @desc    Post a new found item
//                               @route   POST /api/items/found
//                               @access  Private
//===========================================================================
// ---------------------------
// Robust postFoundItem()
// ---------------------------
// ---------------------------
// Robust postFoundItem()
// ---------------------------
const postFoundItem = async (req, res, next) => {
  try {
    // Debug: log incoming data so we can see what's actually coming from frontend
    console.log("=== postFoundItem called ===");
    console.log(
      "req.user (from protect middleware):",
      req.user ? { id: req.user.id, email: req.user.email } : req.user
    );
    console.log("Raw req.body:", req.body);
    console.log("Raw req.file:", req.file);

    // 1) Ensure user is authenticated (protect middleware should set req.user)
    if (!req.user || !req.user.id) {
      // 401 better than crashing with undefined req.user.id
      return res.status(401).json({ message: "Not authorized. Please login." });
    }

    // 2) Extract fields (support both direct objects and JSON-string payloads)
    // Frontend may send foundLocation as JSON string or as nested object.
    let {
      itemName,
      description,
      category,
      foundDate,
      foundLocation, // might be JSON string like '{"address":"..."}' or an object
      type
    } = req.body;

    // If frontend used different key name for date (e.g., 'date'), try fallback
    if (!foundDate && req.body.date) foundDate = req.body.date;

    // 3) Basic server-side validation for required fields
    const missing = [];
    if (!itemName || !String(itemName).trim()) missing.push("itemName");
    if (!description || !String(description).trim()) missing.push("description");
    if (!category || !String(category).trim()) missing.push("category");
    if (!foundDate) missing.push("foundDate");
    if (!foundLocation && !req.body.location) missing.push("foundLocation (or location)");

    if (missing.length) {
      return res.status(400).json({ message: `Missing required fields: ${missing.join(", ")}` });
    }

    // 4) Normalize foundLocation to an object { address: "..." }
    let parsedLocation = null;
    if (typeof foundLocation === "string") {
      // try parsing JSON string
      try {
        parsedLocation = JSON.parse(foundLocation);
      } catch (err) {
        // maybe frontend sent plain address string (not JSON). handle that:
        parsedLocation = { address: foundLocation };
      }
    } else if (typeof foundLocation === "object" && foundLocation !== null) {
      parsedLocation = foundLocation;
    } else if (req.body.location) {
      // fallback if frontend sent location directly (fd.append("location", ...))
      parsedLocation = { address: req.body.location };
    } else {
      // Shouldn't happen because we validated earlier, but safe-check
      return res.status(400).json({ message: "Invalid or missing foundLocation" });
    }

    // 5) Handle multer file => convert to string path expected by schema
    let imagePath = null;
    if (req.file) {
      imagePath = `uploads/images/${req.file.filename}`;
    }

    // 6) Build the document to save (explicit fields — avoid spreading raw req.body)
    const foundItemData = {
      itemName: String(itemName).trim(),
      description: String(description || "").trim(),
      category: String(category).trim(),
      foundDate: new Date(foundDate), // convert to Date — mongoose can accept string too, but explicit is nicer
      foundLocation: {
        address: String(parsedLocation.address || "").trim()
      },
      finder: req.user.id, // protected route ensures this exists
      image: imagePath,
      // status is defaulted by schema so we don't need to set it
    };

    // 7) Save to DB
    const created = await FoundItem.create(foundItemData);
    console.log("Found item created:", { id: created._id, itemName: created.itemName });

    // >>> CHANGE: Reverse matching trigger (Found -> Lost)
    // Why: agar pehle se Lost items pade hain, ab ye Found create hote hi
    //      unke saath matches ban jayen — script chalane ki need na pade.
    try {
      console.log("[RM] about to run reverse matching for found:", created._id, created.itemName);
      const revMatches = await findMatchesForFoundItem(created);
      // Helpful, concise log — production me ye info-level kaafi hai:
      console.log(`Reverse matching: created ${Array.isArray(revMatches) ? revMatches.length : 0} match(es) for found ${created._id}`);
    } catch (e) {
      // Agar duplicate index (11000) ya koi transient error aye, server crash na ho:
      console.error("Reverse matching error:", e);
    }
    // <<< CHANGE END

    // 8) Respond to client (keep as-is)
    return res.status(201).json({ message: "Found item created", item: created });
  } catch (err) {
    // 9) Helpful error responses
    console.error("ERROR IN postFoundItem:", err);

    // If mongoose validation error, return readable messages
    if (err && err.name === "ValidationError") {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ message: messages.join("; ") });
    }

    // Generic server error with stack in non-production
    return res.status(500).json({ message: "Server error creating found item", error: err.message });
  }
};





//=========================================================================================

//=====================================================================================================
//                               GET ALL LOST ITEMS FOR PUBLIC VIEW
//                               @desc    Get all lost items
//                               @route   GET /api/items/lost
//                               @access  Public
//=====================================================================================================
     
 const getLostItems = async (req, res, next) => {
  try {
    // Database se saare lost items fetch karo.
    // .sort({ createdAt: -1 }) se sabse naye post upar dikhenge.
    const items = await LostItem.find({}).sort({ createdAt: -1 });

    // Privacy ke liye, har item se zaroori data hi nikal kar bhejeinge.
    const publicItems = items.map(item => ({
      id: item._id,
      itemName: item.itemName,
      description: item.description,
      category: item.category,
      lostDate: item.lostDate,
      lostLocation: item.lostLocation.address,
      image: item.image,
      createdAt: item.createdAt
    }));

    res.status(200).json(publicItems);
  } catch (error) {
    next(error);
  }
};

//=====================================================================================================
//                               GET ALL FOUND ITEMS FOR PUBLIC VIEW
//                               @desc    Get all found items
//                               @route   GET /api/items/found
//                               @access  Public
//=====================================================================================================
const getFoundItems = async (req, res, next) => {
  try {
    // Database se saare found items fetch karo.
    const items = await FoundItem.find({}).sort({ createdAt: -1 });

    const publicItems = items.map(item => ({
        id: item._id,
        itemName: item.itemName,
        description: item.description,
        category: item.category,
        foundDate: item.foundDate,
        foundLocation: item.foundLocation.address,
        image: item.image,
        createdAt: item.createdAt
      }));

    res.status(200).json(publicItems);
  } catch (error) {
    next(error);
  }
};




// ===================================== GET SINGLE LOST ITEM BY ID ==================================================
//                                       @desc    Get a single lost item by IT'S ID
//                                       @route   GET /api/items/lost/:id
//                                       @access  Public
// ===============================================================================================================
const getLostItemById = async (req, res, next) => {
  try {
    const item = await LostItem.findById(req.params.id);

    if (!item) {
      res.status(404); // Not Found
      throw new Error('Lost item not found');
    }

    // Privacy ke liye, public ko dikhane layak data hi bhejenge.
    const publicItem = {
        id: item._id,
        itemName: item.itemName,
        description: item.description,
        category: item.category,
        lostDate: item.lostDate,
        lostLocation: item.lostLocation.address,
        image: item.image, // Image URL bhejenge
        createdAt: item.createdAt
    };

    res.status(200).json(publicItem);
  } catch (error) {
    next(error);
  }
};

// ===================================== GET SINGLE FOUND ITEM BY ID ==================================================
//                                           @desc    Get a single found item by its ID
//                                           @route   GET /api/items/found/:id
//                                           @access  Public
// ===============================================================================================================
const getFoundItemById = async (req, res, next) => {
    try {
      const item = await FoundItem.findById(req.params.id);
  
      if (!item) {
        res.status(404); // Not Found
        throw new Error('Found item not found');
      }
  
      const publicItem = {
          id: item._id,
          itemName: item.itemName,
          description: item.description,
          category: item.category,
          foundDate: item.foundDate,
          foundLocation: item.foundLocation.address,
          image: item.image,
          createdAt: item.createdAt
      };
  
      res.status(200).json(publicItem);
    } catch (error) {
      next(error);
    }
  };

  // @desc    Get all lost items for the logged-in user
// @route   GET /api/items/lost/my
// @access  Private
const getMyLostItems = async (req, res, next) => {
  try {
    // Sirf wo items dhundho jinka owner logged-in user hai
    const items = await LostItem.find({ owner: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(items);
  } catch (error) {
    console.error('ERROR IN: getMyLostItems()', error);
    next(error);
  }
};

// @desc    Get all found items for the logged-in user
// @route   GET /api/items/found/my
// @access  Private
const getMyFoundItems = async (req, res, next) => {
  try {
    // Sirf wo items dhundho jinka finder logged-in user hai
    const items = await FoundItem.find({ finder: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(items);
  } catch (error) {
    console.error('ERROR IN: getMyFoundItems()', error);
    next(error);
  }
};

// ==================================================================================
//                                    UPDATE LOST ITEM
//                                    @desc    Update a lost item
//                                    @route   PUT /api/items/lost/:id
//                                    @access  Private
// =====================================================================================
// const updateLostItem = async (req, res, next) => {
//   try {
//     let item = await LostItem.findById(req.params.id);

//     if (!item) {
//       res.status(404);
//       throw new Error(`Lost item not found with id: ${req.params.id}`);
//     }

//     // Security Check: Verify ki user hi item ka owner hai
//     // item.owner ek ObjectId hai aur req.user.id ek string hai, isliye .toString() zaroori hai
//     if (item.owner.toString() !== req.user.id) {
//       res.status(401); // Unauthorized
//       throw new Error('User not authorized to update this item');
//     }

//     // Agar user authorized hai, to item ko update karo
//     item = await LostItem.findByIdAndUpdate(req.params.id, req.body, {
//       new: true, // Isse humein updated data wapas milega
//       runValidators: true, // Mongoose ke schema validators chalenge
//     });

//     res.status(200).json(item);
//   } catch (error) {
//     console.error('ERROR IN: updateLostItem()', error);
//     next(error);
//   }
// };
const updateLostItem = async (req, res, next) => {
  try {
    // 1) fetch item
    const item = await LostItem.findById(req.params.id);
    if (!item) {
      res.status(404);
      return next(new Error('Lost item not found'));
    }

    // 2) ownership check
    if (item.owner.toString() !== req.user.id) {
      res.status(401);
      return next(new Error('User not authorized to update this item'));
    }

    // 3) prepare update object (only allowed fields)
    const updates = {}; // we'll build this explicitly to avoid raw req.body pitfalls

    // Allowed text fields mapping:
    const allowed = ['itemName','description','category','secretIdentifier','lostDate'];
    allowed.forEach((k) => {
      if (typeof req.body[k] !== 'undefined' && req.body[k] !== null) {
        updates[k] = req.body[k];
      }
    });

    // location handling: support JSON string or location field
    if (req.body['lostLocation']) {
      // could be JSON string or object
      try {
        updates.lostLocation = typeof req.body.lostLocation === 'string'
          ? JSON.parse(req.body.lostLocation)
          : req.body.lostLocation;
      } catch (e) {
        // fallback if it was a plain string address
        updates.lostLocation = { address: String(req.body.lostLocation) };
      }
    } else if (req.body.location) {
      updates.lostLocation = { address: req.body.location };
    }

    // 4) handle file replacement (if user uploaded new image)
    if (req.file) {
      // build string path for DB similar to create logic
      const imagePath = `uploads/images/${req.file.filename}`;
      updates.image = imagePath;

      // optionally remove old image file (if existed)
      if (item.image) {
        // remove previous file asynchronously (don't block)
        removeFileIfExists(item.image).catch(() => {});
      }
    }

    // 5) run update with validators
    const updated = await LostItem.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    return res.status(200).json(updated);
  } catch (error) {
    console.error('ERROR IN: updateLostItem()', error);
    // Mongoose validation error handling
    if (error && error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ message: messages.join('; ') });
    }
    next(error);
  }
};
// ==================================================================================
//                                    UPDATE FOUND ITEM
//                                        @desc    Update a found item
//                                        @route   PUT /api/items/found/:id
//                                        @access  Private
// =====================================================================================
// const updateFoundItem = async (req, res, next) => {
//     try {
//       let item = await FoundItem.findById(req.params.id);
  
//       if (!item) {
//         res.status(404);
//         throw new Error(`Found item not found with id: ${req.params.id}`);
//       }
  
//       // Security Check: Verify ki user hi item ka finder hai
//       if (item.finder.toString() !== req.user.id) {
//         res.status(401);
//         throw new Error('User not authorized to update this item');
//       }
  
//       item = await FoundItem.findByIdAndUpdate(req.params.id, req.body, {
//         new: true,
//         runValidators: true,
//       });
  
//       res.status(200).json(item);
//     } catch (error) {
//       console.error('ERROR IN: updateFoundItem()', error);
//       next(error);
//     }
//   };
const updateFoundItem = async (req, res, next) => {
  try {
    const item = await FoundItem.findById(req.params.id);
    if (!item) {
      res.status(404);
      return next(new Error('Found item not found'));
    }

    // ownership check
    if (item.finder.toString() !== req.user.id) {
      res.status(401);
      return next(new Error('User not authorized to update this item'));
    }

    const updates = {};
    const allowed = ['itemName','description','category','foundDate'];
    allowed.forEach((k) => {
      if (typeof req.body[k] !== 'undefined' && req.body[k] !== null) {
        updates[k] = req.body[k];
      }
    });

    // foundLocation support
    if (req.body['foundLocation']) {
      try {
        updates.foundLocation = typeof req.body.foundLocation === 'string'
          ? JSON.parse(req.body.foundLocation)
          : req.body.foundLocation;
      } catch (e) {
        updates.foundLocation = { address: String(req.body.foundLocation) };
      }
    } else if (req.body.location) {
      updates.foundLocation = { address: req.body.location };
    }

    // file handling
    if (req.file) {
      const imagePath = `uploads/images/${req.file.filename}`;
      updates.image = imagePath;
      if (item.image) {
        removeFileIfExists(item.image).catch(() => {});
      }
    }

    const updated = await FoundItem.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    return res.status(200).json(updated);
  } catch (error) {
    console.error('ERROR IN: updateFoundItem()', error);
    if (error && error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ message: messages.join('; ') });
    }
    next(error);
  }
};


// =================================== DELETE LOST ITEM ============================================
                                     // @desc    Delete a lost item
                                     // @route   DELETE /api/items/lost/:id
                                     // @access  Private
// ================================================================================
const deleteLostItem = async (req, res, next) => {
  try {
    const item = await LostItem.findById(req.params.id);

    if (!item) {
      res.status(404);
      throw new Error(`Lost item not found with id: ${req.params.id}`);
    }

    // Security Check: Verify ki user hi item ka owner hai
    if (item.owner.toString() !== req.user.id) {
      res.status(401); // Unauthorized
      throw new Error('User not authorized to delete this item');
    }

    // Agar user authorized hai, to item ko delete karo
    await item.deleteOne();

    res.status(200).json({ success: true, message: 'Item removed successfully' });
  } catch (error) {
    console.error('ERROR IN: deleteLostItem()', error);
    next(error);
  }
};

// @desc    Delete a found item
// @route   DELETE /api/items/found/:id
// @access  Private
const deleteFoundItem = async (req, res, next) => {
    try {
      const item = await FoundItem.findById(req.params.id);
  
      if (!item) {
        res.status(404);
        throw new Error(`Found item not found with id: ${req.params.id}`);
      }
  
      // Security Check: Verify ki user hi item ka finder hai
      if (item.finder.toString() !== req.user.id) {
        res.status(401);
        throw new Error('User not authorized to delete this item');
      }
  
      await item.deleteOne();
  
      res.status(200).json({ success: true, message: 'Item removed successfully' });
    } catch (error) {
      console.error('ERROR IN: deleteFoundItem()', error);
      next(error);
    }
  };



// Apne module.exports ko update karein
module.exports = {
  postLostItem,
  postFoundItem,
  getLostItems,
  getFoundItems,
  getLostItemById,   
  getFoundItemById,  
    getMyLostItems,    
    getMyFoundItems,   
    updateLostItem,   
  updateFoundItem,
    deleteLostItem,
  deleteFoundItem
};