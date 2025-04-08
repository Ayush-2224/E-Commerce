import Seller from "../models/seller.model.js";
import cloudinary, { uploadToCloudinary } from "../lib/cloudinary.js";
import HttpError from "../models/http-error.js";
import generateTokenSeller from "../lib/seller.generateToken.js";

const signup = async(req,res,next)=>{
    try {
        const {username, password, email, address} = req.body;
        if([email, username, password, address].some((field) =>
                field?.trim() === "")
        ){
            return res.status(401).json({message: `${field} is required`});
        }

        const seller = await Seller.findOne({email});
        let imageUrl;
        if(seller) return res.status(401).json({message: "Seller Already exists! Please Login"});
        
        if(req.file){
            const result = await uploadToCloudinary(req.file.buffer)
            imageUrl = result.secure_url
        }
        const newSeller = new Seller({
            username,
            email,
            password,
            profilePic: imageUrl,
            address
        });

        if(!newSeller) return res.status(500).json({message: "Invalid Seller Data"});
        await newSeller.save();
        
        // generate token
        generateTokenSeller(newSeller._id, res);
        return res.status(200).json({
            _id: newSeller._id,
            username: newSeller.username,
            email: newSeller.email,
            profilePic: newSeller.profilePic,
            address: newSeller.address,
            rating: newSeller.rating
        });

    } catch (error) {
        console.log("signup error", error);
        return next(new HttpError("ISE", 400));
    }
}

const login = async(req,res,next)=>{
    const {email, password} = req.body;
    if(!email || email.trim() === "") return res.status(400).json({message: "Email is required"});
    if(!password || password.trim() === "") return res.status(400).json({message: "Password is required"});
    
    const seller = await Seller.findOne({email});
    if(!seller) return res.status(400).json({message: "Invalid credentials email"});
    
    const isPasswordCorrect = await seller.isPasswordCorrect(password);
    if(!isPasswordCorrect){
        return res.status(400).json({message: "Invalid credentials password"});
    }
    
    generateToken(seller._id, res);
    return res.status(200).json({
        _id: seller._id,
        username: seller.username,
        email: seller.email,
        profilePic: seller.profilePic,
        address: seller.address,
        rating: seller.rating
    });
}

const logout = async(req,res,next)=>{
    try {
        res.cookie("jwt", "", {maxAge: 0});
        return res.status(200).json({message: "logout completed successfully"});
    } catch (error) {
        console.log("logout: ", error);
        return next(new HttpError("ISE", 400));
    }
}

export {signup, login, logout};