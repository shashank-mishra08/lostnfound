const express = require('express');
const router = express.Router();
const fileUpload = require('../middleware/file-upload'); // Keep this one
const { postLostItem, postFoundItem, getFoundItems,getLostItems,  
     getLostItemById, getFoundItemById, getMyLostItems,getMyFoundItems
, updateLostItem, updateFoundItem, deleteLostItem, deleteFoundItem
     } = require('../controllers/itemController');
const { protect } = require('../middleware/authMiddleware');
// Removed the duplicate 'const fileUpload = require('../middleware/file-upload');' from here
// =============== PRIVATE ROUTES, TOKEN REQUIRED =================
// '/lost' par POST request aane par pehle 'protect' middleware chalega,
// fir 'postLostItem' controller chalega.
router.post('/lost', protect, fileUpload.single('image'), postLostItem);
// Found item post karne ka route
router.post('/found', protect, fileUpload.single('image'), postFoundItem); // Ye nayi line add karein
// '/found' par POST request aane par pehle 'protect' middleware chalega,
// fir 'postFoundItem' controller chalega.
router.get('/lost/my', protect, getMyLostItems);   // Ye raha "My Lost Items" ka route
router.get('/found/my', protect, getMyFoundItems);  // Ye raha "My Found Items" ka route
// === PUBLIC & PRIVATE ROUTES FOR A SINGLE ID ===
router
    .route('/lost/:id')
    .get(getLostItemById) // Public: Koi bhi dekh sakta hai
    .put(protect,fileUpload.single('image'), updateLostItem) // Changed 'upload.single' to 'fileUpload.single'
    .delete(protect, deleteLostItem); // Private: Sirf owner delete kar sakta hai

router
    .route('/found/:id')
    .get(getFoundItemById) // Public
    .put(protect, fileUpload.single('image'), updateFoundItem) // Changed 'upload.single' to 'fileUpload.single'
    .delete(protect, deleteFoundItem); // Private: Sirf owner delete kar sakta hai

// ========================================================================
// =============== PUBLIC ROUTES, NO TOKEN REQUIRED =================
router.get('/lost', getLostItems);
router.get('/found', getFoundItems);
router.get('/lost/:id', getLostItemById);
router.get('/found/:id', getFoundItemById);
// Yahan :id us item ki unique ID hogi jise hum dekhna chahte hain.
// ===================================================================
module.exports = router;


//Aakhri kadam, server.js ko batana hai ki /api/items se shuru hone wali sabhi requests ko 
// itemRoutes.js file handle karegi. Apni server.js file me itemRoutes wali line ko uncomment kar dein.