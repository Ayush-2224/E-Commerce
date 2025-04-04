import express from 'express'
import cookieparser from 'cookie-parser'
import cors from 'cors'
import connectDb from './lib/db.js'
import userAuthRoutes from './routes/userAuth.router.js'
import sellerAuthRoutes from './routes/sellerAuth.router.js'
import productRoutes from './routes/product.router.js'
import orderRoutes from './routes/order.router.js'
import paymentRoutes from './routes/payment.router.js'
import cartRoutes from './routes/cart.router.js'
import reviewRoutes from './routes/review.router.js'

const app =express();

import dotenv from 'dotenv';
dotenv.config();

app.use(cors({origin:"http://localhost:5173",
    credentials:true}))

app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 
app.use(cookieparser())

app.use("/api/user",userAuthRoutes)
app.use("/api/seller",sellerAuthRoutes)
app.use("/api/product",productRoutes)
app.use("/api/order",orderRoutes)
app.use("/api/payment",paymentRoutes)
app.use("/api/cart",cartRoutes)
app.use("/api/review",reviewRoutes)

app.use((error, req, res, next) =>{
    if(res.headerSent){
        return next(error)
    }
    res.status(error.code || 500)
    res.json({message: error.message || "An unknown error occured"})
})

const PORT=process.env.PORT
app.listen(PORT,()=>{
    console.log(`server is running on port ${PORT}`)
    connectDb()
})