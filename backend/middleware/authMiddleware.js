// is file ka kaam hai ki user ke authentication ko handle karein
//  bina iske, user ko kisi bhi protected route tak access nahi milega
//  backend me authorization system laga liya hai. Ab aap koi bhi aisi API bana sakte hain jise sirf logged-in user hi istemal kar sakein.

const jwt = require('jsonwebtoken');
const User = require('../models/user');

const protect = async (req, res, next) => {
  let token;

  // 1. Check karo ki request ke headers me authorization hai aur wo 'Bearer' se shuru ho raha hai
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // 2. Header se token nikalo ('Bearer <token>')
      token = req.headers.authorization.split(' ')[1];

      // 3. Token ko verify karo
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 4. Token ke payload se user ki ID nikalo aur database se user ko fetch karo
      //    '-password' likhne se user ke data ke saath password nahi aayega
      req.user = await User.findById(decoded.id).select('-password');

      // 5. Agle middleware ya route handler par jao
      next();
    } catch (error) {
      console.error(error);
      res.status(401); // 401 - Unauthorized
      next(new Error('Not authorized, token failed'));
    }
  }

  if (!token) {
    res.status(401);
    next(new Error('Not authorized, no token'));
  }
};

module.exports = { protect };