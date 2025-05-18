import express from 'express'
import cookieparser from 'cookie-parser'
import cors from 'cors'
import connectDb from './lib/db.js'
import userAuthRoutes from './routes/userAuth.router.js'
import sellerAuthRoutes from './routes/sellerAuth.router.js'
import productRoutes from './routes/product.router.js'
import orderRoutes from './routes/order.router.js'
// import paymentRoutes from './routes/payment.router.js'
import cartRoutes from './routes/cart.router.js'
import reviewRoutes from './routes/review.router.js'
import session from 'express-session';
import passport from './Auth/google.js'
import generateTokenUser from './lib/user.generateToken.js'
const app = express();

import dotenv from 'dotenv';
dotenv.config();

app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}))

app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 
app.use(cookieparser());

// Session and Passport configuration
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Initialize Passport and restore authentication state from session
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use("/api/user", userAuthRoutes)
app.use("/api/seller", sellerAuthRoutes)
app.use("/api/product", productRoutes)
app.use("/api/order", orderRoutes)
// app.use("/api/payment",paymentRoutes)
app.use("/api/cart", cartRoutes)
app.use("/api/review", reviewRoutes)


// Error handling middleware
app.use((error, req, res, next) => {
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
        console.log(error);
        return res.status(400).json({ error: 'Unexpected file upload.' });
    }
    if(res.headerSent) {
        return next(error);
    }
    res.status(error.code || 500)
    res.json({message: error.message || "An unknown error occurred"})
});

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`)
    connectDb()
})