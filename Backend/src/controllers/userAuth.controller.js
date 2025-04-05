import User from "../models/user.model.js";
import cloudinary from "../lib/cloudinary.js";
import generateToken from "../lib/generateTOken.js";
import HttpError from "../models/http-error.js";
const signup = async(req,res,next)=>{
    try {
        const {username,password,email,profilePic}=req.body;
        if([email,username,password].some((field)=>
                field?.trim()==="")
           ){
            return res.status(401).json({message:`${field} is required`});
           }

        const user=await User.findOne({email});
        let imageUrl
        if(user) return res.status(401).json({message:"User Already exists! Please Login"})
        
        if(profilePic){
            imageUrl=(await cloudinary.uploader.upload(profilePic)).secure_url
        }
        const newUser=User({
            username,
            email,
            password,
            profilePic:imageUrl
        })

        if(!newUser) return res.status(500).json({message:"Invalid User Data"})
        await newUser.save()
    // generate token
    generateToken(newUser._id,res)
        return res.status(200).json({
            _id:newUser._id,
            username:newUser.username,
            email:newUser.email,
            profilePic: newUser.profilePic})

        
    } catch (error) {
        console.log("signup error",error)
        return next(new HttpError("ISE", 400))
    }
    
}

const login= async(req,res,next)=>{
    const {email,password}=req.body
    if(!email || email.trim()==="") return res.status(400).json({message:"Email is required"})
    if(!password || password.trim()==="") return res.status(400).json({message:"Password is required"})
    const user = await User.findOne({email})
    if(!user) return res.status(400).json({message:"Invalid credentials email"})
    const isPasswordCorrect=await user.isPasswordCorrect(password)
    if(!isPasswordCorrect){
        return res.status(400).json({message:"Invalid credentials password"})
    }
    generateToken(user._id,res)
    // console.log("login success");
    return res.status(200).json({
        _id:user._id,
        username:user.username,
        email:user.email,
        profilePic:user.profilePic
    })
}

const logout=async(req,res,next)=>{
    try {
        res.cookie("jwt","",{maxAge:0})
        return res.status(200).json({message:"logout completed successfully"})
    } catch (error) {
        console.log("logout: ", error)
        return next(new HttpError("ISE", 400))
    }
}

export {signup,login,logout}