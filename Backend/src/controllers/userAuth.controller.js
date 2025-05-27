import User from "../models/user.model.js";
import cloudinary, { uploadToCloudinary } from "../lib/cloudinary.js";
import HttpError from "../models/http-error.js";
import generateTokenUser from "../lib/user.generateToken.js";
import passport from "../Auth/google.js";
import jwt from "jsonwebtoken";
import transporter from "../lib/nodeMailer.js";
const signup = async(req,res,next)=>{
    try {
        const {username,password,email}=req.body;
        if([email,username,password].some((field)=>
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
            imageUrl = "aa"
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
    const {email,password}=req.body
    if(!email || email.trim()==="") return res.status(400).json({message:"Email is required"})
    if(!password || password.trim()==="") return res.status(400).json({message:"Password is required"})
    const user = await User.findOne({email})
    if(!user) return res.status(400).json({message:"Invalid credentials email"})
    const isPasswordCorrect=await user.isPasswordCorrect(password)
    if(!isPasswordCorrect){
        return res.status(400).json({message:"Invalid credentials password"})
    }
    generateTokenUser(user._id,res)
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

  const clientURL = "http://localhost:5173";

  const googleCallback = [
    passport.authenticate('google', {
      failureRedirect: '/api/user/login',
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
        console.error('Google callback error:', err);
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
     const resetURL = `http://localhost:3000/user/reset-password/${token}`;
 
     await transporter.sendMail({
       to: email,
       subject: "Password Reset",
       html: `<p>Click <a href="${resetURL}">here</a> to reset your password</p>`,
     });
     res.json({ msg: "Reset email sent" });
 
   } catch (error) {
     console.log("forgotPassword error", error);
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
export {signup,login,logout,checkAuth,googleAuth,googleCallback,forgotPassword,resetPassword}