import express from 'express'
import dotenv from 'dotenv'
import cookieparser from 'cookie-parser'
import cors from 'cors'
const app =express();

dotenv.config()

app.use(cors({origin:"http://localhost:5173",
    credentials:true}))

app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 
app.use(cookieparser())

const PORT=process.env.PORT
server.listen(PORT,()=>{
    console.log(`server is running on port ${PORT}`)
    // connectDB()
})