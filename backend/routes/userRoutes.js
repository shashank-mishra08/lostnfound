// Ye file URL ko controller ke logic se jodegi.
// Ye file sirf routes define karegi, actual logic controller me hoga.
// pehle to server hi chalu karna padega, tabhi ye routes kaam karengi.
// Aakhri kadam, apne server.js ko batana hai ki wo in naye routes ka istemal kare. server.js file me API ROUTES section me jayein aur userRoutes wali line ko uncomment kar dein.
// sever aapko wahan se yahan redirect karega.



const express = require('express');
const router = express.Router();

// Controller se registerUser function ko import karo
const { registerUser,loginUser,getMe } = require('../controllers/userController');
// Middleware se 'protect' function ko import karo
const { protect } = require('../middleware/authMiddleware');

// Jab bhi '/register' par POST request aayegi, to 'registerUser' function chalega
router.post('/register', registerUser);
// Aage hum login ke liye route bhi yahin banayenge
 router.post('/login', loginUser);
 // Naya protected route. Yahan 'protect' middleware pehle chalega.
// Agar middleware ne request pass ki, tabhi 'getMe' function chalega.
router.get('/me', protect, getMe);



module.exports = router;