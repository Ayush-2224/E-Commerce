import User from '../models/user.model.js'
import jwt from 'jsonwebtoken'
const verifyUserAuthentication= async (req,res,next)=>{
    try {
        const token =req.cookies.jwt
        if(!token){
            return res.status(401).json({message:"Unathourised Token not found"
            })
        }
        const decoded=jwt.verify(token,process.env.JWT_SECRET_USER)
        if(!decoded){
            return res.status(401).json({message:"Invalid token"
            })
        }
        const user=await User.findById(decoded.userId).select("-password");
        
        if(!user){
            return res.status(404).json({message:"user not found"
            })
        }
        req.userData=user
        next()

    } catch (error) {
        console.log("auth middleware: ", error)
        return res.status(400).json({message:"ISE"})
    }
}

export default verifyUserAuthentication;