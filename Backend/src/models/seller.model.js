import mongoose from 'mongoose'
import bcrypt from'bcryptjs'
import HttpError from './http-error.js';
const sellerSchema =mongoose.Schema({
     username:{
        type:String,
        trim: true,
        minlength: [3, 'Username must be at least 3 characters long'],
        required: [true, 'Username is required']
     },
     password:{
        type:String,
        minlength: [8, "Password must me of atleast 8 characters"]
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
     rating:{
        type: Number,
        default:0
     },
     address:{
        type: String,
        required:true,
     },
     razorpayAccountId:{
        type:String,
        default:""
     }
},{timestamps:true})

sellerSchema.pre("save", async function(next) {
   if (!this.isModified("password")) return next();
   try {
       this.password = await bcrypt.hash(this.password, 10);
       next();
   } catch (err) {
       next(new HttpError("An error occured", 500));
   }
});

sellerSchema.methods.isPasswordCorrect=async function(password){
   return await bcrypt.compare(password,this.password)
}

const Seller= mongoose.model("Seller",sellerSchema)


export default Seller