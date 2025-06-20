import mongoose from 'mongoose'
import bcrypt from'bcryptjs'
import HttpError from './http-error.js';
import Cart from './cart.model.js';
const userSchema =mongoose.Schema({
   googleId: {
      type: String,
      unique: true,
      sparse: true
    },    
     username:{
        type:String,
        trim: true,
        index:true,
        minlength:3
     },
     password:{
        type:String,
        minlength:8
     },
     email:{
        type:String,
        unique:true,
        index:true
     },
     profilePic:{
        type:String,
        default:""
     },
     address:{
      type:String,
      required:true,
      trim:true   
     }
},{timestamps:true})

userSchema.pre("save", async function(next) {
   if (!this.isModified("password")) return next();
   try {
       this.password = await bcrypt.hash(this.password, 10);
       next();
   } catch (err) {
       next(new HttpError("Failed to hash password", 500));
   }
});

userSchema.pre("save", async function(next) {
   if (!this.isNew) {
      //console.log("User already exists");
      return next();
   }

   try {
       await Cart.create({ userId: this._id });
       console.log("Cart created");
       next();
   } catch (err) {
       next(new HttpError("Failed to create cart", 500));
   }
});

userSchema.methods.isPasswordCorrect=async function(password){
   return await bcrypt.compare(password,this.password)
}

const User= mongoose.model("User",userSchema)


export default User