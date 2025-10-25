const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  // User ka naam, jo ki zaroori (required) hai.
  name: {
    type: String,
    required: true,
  },
  // User ka email, jo zaroori hai aur unique (har user ka alag) hona chahiye.
  email: {
    type: String,
    required: true,
    unique: true,
  },
  // User ka password. Ye zaroori nahi hai kyunki Google se sign-in karne par password nahi hoga.
  password: {
    type: String,
  },
  // Google se sign-in karne wale user ki Google ID store karne ke liye.
  googleId: {
    type: String,
  },
  // User ka phone number store karne ke liye.
  phoneNumber: {
    type: String,
  },
}, {
  // Ye option automatically do fields add kar deta hai:
  // 'createdAt': Jab user create hua.
  // 'updatedAt': Jab user last time update hua.
  timestamps: true,
});

module.exports = mongoose.models.User || mongoose.model('User', UserSchema);