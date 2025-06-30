import User from "../models/user.model.js";
import { uploadToCloudinary } from "../lib/cloudinary.js";
import HttpError from "../models/http-error.js";
import generateTokenUser from "../lib/user.generateToken.js";
import passport from "../Auth/google.js";
import jwt from "jsonwebtoken";
import transporter from "../lib/nodeMailer.js";
import History from "../models/history.model.js";
const signup = async(req,res,next)=>{
    //console.log("called");
    try {
        const {username,password,email,address}=req.body;
        if([email,username,password,address].some((field)=>
                field?.trim()==="")
           ){
            return res.status(401).json({message:`${field} is required`});
           }

        const user=await User.findOne({email});
        let imageUrl
        if(user) return res.status(401).json({message:"User Already exists! Please Login"})
        
        if(req.file){
            const result = await uploadToCloudinary(req.file.buffer);
            imageUrl = result.secure_url
        }else{
            imageUrl = "https://static.vecteezy.com/system/resources/previews/026/434/417/original/default-avatar-profile-icon-of-social-media-user-photo-vector.jpg"
        }
        const newUser=User({
            username,
            email,
            password,   
            profilePic:imageUrl,
            address
        })

        if(!newUser) return res.status(500).json({message:"Invalid User Data"})
        await newUser.save()
   // console.log("saved")
    // generate token
    generateTokenUser(newUser._id,res)
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
   // console.log("login called");
   try {
     const {email,password}=req.body
     if(!email || email.trim()==="") return res.status(400).json({message:"Email is required"})
     if(!password || password.trim()==="") return res.status(400).json({message:"Password is required"})
     const user = await User.findOne({email})
     if(!user) return res.status(400).json({message:"Invalid credentials email"})
     const isPasswordCorrect=await user.isPasswordCorrect(password)
     if(!isPasswordCorrect){
         return res.status(400).json({message:"Invalid credentials"})
     }
     generateTokenUser(user._id,res)
     // console.log("login success");
     return res.status(200).json({
         _id:user._id,
         username:user.username,
         email:user.email,
         profilePic:user.profilePic
     })
   } catch (error) {
       console.log("login error",error)
       return next(new HttpError("ISE", 400))
    
   }
}

const logout=async(req,res,next)=>{
  console.log("logout called");
    try {
        res.cookie("jwt","",{maxAge:0})
        return res.status(200).json({message:"logout completed successfully"})
    } catch (error) {
        console.log("logout: ", error)
        return next(new HttpError("ISEjkkj", 400))
    }
}
const checkAuth=async(req,res,next)=>{
    try {
        return res.status(200).json(req.userData)
    } catch (error) {
        console.log("checkAuth: ", error)
        return next(new HttpError("ISE", 400))

    }
}   

 const googleAuth = passport.authenticate('google', {
    scope: ['profile', 'email'],
    prompt: 'select_account',
  });

  const clientURL = process.env.Frontend_URL;
  const googleCallback = [
    passport.authenticate('google', {
      failureRedirect: `${clientURL}/user/signup`,
      session: false,
    }),
    async (req, res) => {
      try {
        if (!req.user || !req.user._id) {
          throw new HttpError('No user returned from Google', 500);
        }
  
        generateTokenUser(req.user._id, res);

      return res.redirect(`${clientURL}`);
        
      } catch (err) {
        //console.error('Google callback error:', err);
        return res.redirect(`${clientURL}/user/signup`);
      }
    }
  ];

  const forgotPassword = async (req,res,next)=>{
    const {email}=req.body
   try {
     const user = await User.findOne({email})
     if(!user){
         return next(new HttpError("User not found", 404));
     }
 
     const JWT_SECRET = process.env.JWT_SECRET_USER;
     const token =jwt.sign({ email }, JWT_SECRET, { expiresIn: "15m" });
     const resetURL = `${process.env.Frontend_URL}/user/reset-password/${token}`;
 
     await transporter.sendMail({
         from: process.env.MAIL_USER,
       to: email,
       subject: "Password Reset",
       html: `<p>Click <a href="${resetURL}">here</a> to reset your password</p>`,
     });
     return res.json({ message: "Reset email sent" });
 
   } catch (error) {
     //console.log("forgotPassword error", error);
     return next(new HttpError("ISE", 400));
   }
  }

  const resetPassword = async (req, res) => {
    const {token,password} = req.body;
    
    try {
        const {email}=jwt.verify(token, process.env.JWT_SECRET_USER);
        const user = await User.findOne({email});
        if(!user) return next(new HttpError("User not found", 404));
        user.password = password;
        await user.save();
        
        res.status(200).json({message:"Password reset successfully"});
    } catch (error) {
        console.log("resetPassword error", error);
        return next(new HttpError("ISE", 400));
    }
  }

  const editProfile = async (req, res,next) => {  
       const user= req.userData;
       try {
        const id=user._id;
        const { username, address} = req.body;
        const dbUser = await User.findById(id);
        if (!dbUser) {
            return res.status(404).json({ message: "User not found" });
        }
        if(username && username.trim()!==""){
            dbUser.username = username;
        }
        if(address && address.trim()!==""){
            dbUser.address = address;
        }
        
        if(req.file) {
            const result = await uploadToCloudinary(req.file.buffer);
            dbUser.profilePic = result.secure_url;
        }
        
        await dbUser.save({ validateBeforeSave: false });
        const info= await User.findById(id).select("-password -__v");

        return res.status(200).json({updatedUserData: info, message: "Profile updated successfully" });

    } catch (error) {
        return next(new HttpError(400, "Internal Server Error"));

    }

}
const userHistory = async (req, res, next) => {
  try {
    const userId = req.userData._id;
    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;

    // Fetch total count of history items
    const total = await History.countDocuments({ userId });

    // Fetch paginated history, and populate product details
    const history = await History.find({ userId })
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .populate("productId", "title price imageUrl rating mrp");

    // Format product info
    const formatted = history.map(entry => {
      return entry.productId
    });

    return res.status(200).json({
      history: formatted,
      total,
      limit,
      offset
    });

  } catch (error) {
    console.error("userHistory error:", error);
    return next(new HttpError("Internal Server Error", 500));
  }
};


export {signup,login,logout,checkAuth,googleAuth,googleCallback,forgotPassword,resetPassword,editProfile,userHistory}