// =================================================================
//                     1. ZAROORI PACKAGES IMPORT
// =================================================================
// Ye sabhi packages hain jinki humein server banane ke liye zaroorat hai.

const express = require("express");
const path = require("path"); // File paths ke saath kaam karne ke liye Node.js ka built-in module.
const dotenv = require('dotenv'); // .env file se secret keys (environment variables) load karne ke liye.
const cors = require('cors'); // Cross-Origin Resource Sharing ko handle karne ke liye.
const connectDB = require('./config/database'); // Hamara banaya hua database connection function.
const serveStatic = require('serve-static');

// =================================================================
//                        2. INITIALIZATION
// =================================================================
// Yahan hum server se judi shuruaati cheezein set kar rahe hain.

// .env file ko load karna taaki process.env me saari keys aa jayein.
dotenv.config({ path: path.resolve(__dirname, './.env') });

// Database se connect karna. Ye function humne 'config/db.js' me banaya hai.
connectDB();

// Express application ko initialize karna. 'app' variable ab hamara server hai.
const app = express();


// =================================================================
//                         3. MIDDLEWARE
// =================================================================
// Middleware wo functions hote hain jo har request ke server tak pahunchne se pehle chalte hain.

// CORS (Cross-Origin Resource Sharing) ko enable karna.
// Ye zaroori hai taaki aapka React App (jo alag URL/port par chalega) is backend se data le sake.
app.use(cors());



// Express ke liye built-in JSON body parser.
// Ye aane wali request ki body ko JSON format se JavaScript object me badal deta hai (req.body).
// `bodyParser.json()` ka naya version `express.json()` hai.
app.use(express.json());

// URL-encoded data ke liye (form data)
app.use(express.urlencoded({ extended: true }));

// Ye middleware 'uploads/images' folder ko publically accessible banata hai.
// Isse jab koi user '/uploads/images/some-image.jpg' URL par jayega,
// to server use wo image file dikha dega. Ye image display ke liye zaroori hai.
app.use("/uploads/images", serveStatic(path.join(__dirname, "uploads", "images")));


// =================================================================
//                           4. API ROUTES
// =================================================================
// Yahan hum apne server ke alag-alag API endpoints define karenge.

// Ek simple test route ye check karne ke liye ki server sahi se chal raha hai.
app.get('/', (req, res) => {
  res.status(200).json({ message: 'Lost & Found API is up and running!' });
});
// User se judi sabhi API calls (register, login) is route se handle hongi
// Hum iske liye alag se 'routes/userRoutes.js' file banayenge
const userRoutes = require('./routes/userRoutes');
app.use('/api/users', userRoutes);

// Hum yahan apne naye routes (user aur item ke liye) add karenge.
 app.use('/api/items', require('./routes/itemRoutes'));
 app.use('/api/matches', require('./routes/matchRoutes'));
 app.use('/api/notifications', require('./routes/notification-route'));
 // ...other routes
app.use('/api/contact-requests', require('./routes/contactRequestRoutes')); // ✅ add this BEFORE your 404 handler





// =================================================================
//                        5. ERROR HANDLING (ye kuchh alg hai mere liye)
// =================================================================

// Agar upar diye gaye kisi bhi route se request match nahi hoti, to ye middleware chalega.
// Ye 'Route not found' ka error dega.
app.use((req, res, next) => {
  const error = new Error(`Route not found - ${req.originalUrl}`);
  res.status(404);
  next(error);
});

// Ye aapka custom error handling middleware hai.
// Agar server me kahin bhi koi error aata hai (chahe route me ya kahin aur),
// to request yahan aayegi aur ek proper JSON format me error response bhejegi.
app.use((error, req, res, next) => {
  // Agar response headers pehle hi bheje ja chuke hain, to error ko aage bhej do.
  if (res.headerSent) {
    return next(error);
  }
  // Error ka status code set karo, ya default 500 (Internal Server Error) rakho.
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  // Error message ko JSON format me bhej do.
  res.json({
    message: error.message,
    // Development mode me error ka stack trace bhi bhej sakte hain debugging ke liye.
    stack: process.env.NODE_ENV === 'production' ? null : error.stack,
  });
});


// =================================================================
//                      6. SERVER KO SHURU KARNA
// =================================================================
// .env file se PORT number lo, ya default 8000 use karo.
const PORT = process.env.PORT || 8000;

// Server ko sune (listen) ke liye start karna.
app.listen(PORT, () => {
  console.log(`Server is running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
