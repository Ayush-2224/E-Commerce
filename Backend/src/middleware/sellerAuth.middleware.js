import Seller from '../models/seller.model.js'
import jwt from 'jsonwebtoken'

const verifySellerAuthentication = async (req,res,next)=>{
    try {
        const token = req.cookies.jwt
        if(!token){
            return res.status(401).json({message:"Unauthorized Token not found"
            })
        }
        const decoded = jwt.verify(token,process.env.JWT_SECRET_SELLER)
        if(!decoded){
            return res.status(401).json({message:"Invalid token"
            })
        }
        const seller = await Seller.findById(decoded.userId).select("-password");
        
        if(!seller){
            return res.status(404).json({message:"Seller not found"
            })
        }
        req.sellerData = seller;
        next();

    } catch (error) {
        console.log("seller auth middleware: ", error)
        return res.status(400).json({message:"ISE"})
    }
}

export default verifySellerAuthentication;
