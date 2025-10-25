const User = require('../models/user'); // User model ko import kiya
const bcrypt = require('bcryptjs'); // Password hashing ke liye
const jwt = require('jsonwebtoken'); // JWT token banane ke liye


// ===============================================================================================
//                                       USER REGISTER FUNCTION 
//                                         @desc    Register a new user
//                                         @route   POST /api/users/register
//                                         @access  Public
//  ==============================================================================================
const registerUser = async (req, res, next) => {
  // 1. Request ki body se name, email, aur password nikalo
  const { name, email, password } = req.body;

  try {
    // 2. Check karo ki saari fields di gayi hain ya nahi
    if (!name || !email || !password) {
      res.status(400); // Bad Request
      throw new Error('Please add all fields');
    }

    // 3. Check karo ki is email se user pehle se exist karta hai ya nahi
    const userExists = await User.findOne({ email });

    if (userExists) {
      res.status(400); // Bad Request
      throw new Error('User already exists');
    }

    // 4. Password ko Hash karo
    const salt = await bcrypt.genSalt(10); // Ek 'salt' generate karo security ke liye
    const hashedPassword = await bcrypt.hash(password, salt); // Password ko salt ke sath hash karo

    // 5. Naya user database me create karo
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    // 6. Agar user successfully create ho gaya
    if (user) {
      // 7. Success response (201 - Created) bhejo
      res.status(201).json({
        _id: user.id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id), // Ek naya token generate karke bhejo
        message: 'User registered successfully',
        // Note: Password ko response me kabhi nahi bhejna chahiye, security ke liye   
       // password:hashedPassword, // Ye line sirf example ke liye hai, production me isko hata dena
      });
    } else {
      res.status(400);
      throw new Error('Invalid user data');
    }
  } catch (error) {
    console.error("Error in registerUser:", error);
    res.status(500); // Internal Server Error
    next(error); // Error ko hamare custom error handler tak bhej do (jo server.js me hai)
  }
};

// JWT Token Generate karne ka function
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '1d', // Token 30 din me expire ho jayega
  });
};

// Is function ko export karo taaki hum ise routes file me use kar sakein

// ==============================================================================================================
//                                  USER LOGIN FUNCTION
//                                    @desc    Authenticate a user (Login)
//                                    @route   POST /api/users/login
//                                    @access  Public
// ==============================================================================================================
const loginUser = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    // Check karo ki email aur password diye gaye hain ya nahi
    if (!email || !password) {
        res.status(400);
        throw new Error('Please provide email and password');
    }

    // 1. Database me user ko email se dhundho
    const user = await User.findOne({ email });

    // 2. Check karo ki user exist karta hai AUR bheja gaya password database ke password se match karta hai
    //    bcrypt.compare() function plain password ko hashed password se compare karta hai
    if (user && (await bcrypt.compare(password, user.password))) {
      // 3. Agar sab theek hai, to success response bhejo
      res.status(200).json({
        _id: user.id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id), // Naya token generate karke bhejo
        message: 'Login successfull',
      });
    } else {
      // Agar user nahi mila ya password galat hai, to error bhejo
      res.status(400);
      throw new Error('Invalid credentials');
    }
  } catch (error) {
    console.error("Error in loginUser:", error);
    next(error); // Error ko hamare custom error handler tak bhej do
  }
};

// ==============================================================================================================
//                                  GET CURRENT USER FUNCTION
//                                    @desc    Get current user data
//                                    @route   GET /api/users/me
//                                    @access  Private
// ==============================================================================================================
// Ye function 'protect' middleware ke through call hota hai, jo user ko authenticate karta hai
// Aur user ki ID ko req.user me set karta hai.
// Isliye humein yahan se sirf user ki details return karni hain.
const getMe = async (req, res, next) => {
    // Middleware ne pehle hi user ko fetch karke req.user me daal diya hai
    // Hum bas use response me bhej denge.
    res.status(200).json(req.user);
};

// Apne module.exports ko update karein taaki getMe bhi export ho
module.exports = {
  registerUser,
  loginUser,
  getMe, // Isko yahan add karein
};
// Note: Ye functions sirf example ke liye hain, production me inhe aur secure aur robust banana padega.
// Jaise ki error handling, input validation, etc. Ye sab aapko apne project me implement karna padega.
// Ye functions aapke user registration, login, aur current user details fetch karne ke liye hain.
// Inhe aapke routes file me use kiya jayega, jahan aap inhe HTTP requests ke sath link karenge.
// Iske liye aapko 'routes/userRoutes.js' file me in functions ko import karna padega.
// Jaise ki
// const { registerUser, loginUser, getMe } = require('../controllers/userController');
// Aur phir aap inhe routes ke sath link kar sakte hain, jaise
// router.post('/register', registerUser);
// router.post('/login', loginUser);
// router.get('/me', protect, getMe);
// Iske baad aapka server.js file in routes ko use karega, jaise ki
// app.use('/api/users', userRoutes);
// Isse aapke user se judi sabhi API calls handle ho jayengi, jaise ki user registration, login, aur current user details fetch karna.
// Ye sab kuchh aapke backend ke liye hai, jisse aapka frontend in API calls ko use karke user registration, login, aur user details fetch kar sakega.
// Iske liye aapko apne frontend me bhi HTTP requests banani hongi, jaise ki
// axios.post('/api/users/register', userData) ya axios.get('/api/users/me', { headers: { Authorization: `Bearer ${token}` } });
// Ye sab aapke frontend ke liye hai, jisse aap user registration, login, aur user details fetch kar sakein
// Ye sab kuchh aapke backend ke liye hai, jisse aapka frontend in API calls ko use karke user registration, login, aur user details fetch kar sakega

