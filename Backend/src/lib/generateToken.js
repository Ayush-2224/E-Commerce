import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import HttpError from '../models/http-error'
dotenv.config()
const generateToken = (userId,res)=>{
    try{
        const token =jwt.sign({
            userId
        },
        process.env.JWT_SECRET,
        
        {
            expiresIn:"7d"
        })
    res.cookie("jwt",token,{
        maxAge:7*24*60*60*1000,
        httpOnly: true,
        sameSite:"strict",
    })
    
    return token
}catch(error){
    console.log("Error generating token", error);
    return next(new HttpError("Internal Server Error", 500))
}
}

export default generateToken