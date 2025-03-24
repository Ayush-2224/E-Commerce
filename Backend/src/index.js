import express from 'express'
import cookieparser from 'cookie-parser'
import cors from 'cors'
import connectDb from './lib/db.js'
import authRoutes from './routes/auth.router.js'
const app =express();

import dotenv from 'dotenv';
dotenv.config();

app.use(cors({origin:"http://localhost:5173",
    credentials:true}))

app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 
app.use(cookieparser())

app.use("/api/auth",authRoutes)

const PORT=process.env.PORT
app.listen(PORT,()=>{
    console.log(`server is running on port ${PORT}`)
    connectDb()
})