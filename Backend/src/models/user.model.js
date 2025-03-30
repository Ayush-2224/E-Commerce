import mongoose from 'mongoose'
import bcrypt from'bcryptjs'
import HttpError from './http-error';
const userSchema =mongoose.Schema({
     username:{
        type:String,
        trim: true,
        index:true
     },
     password:{
        type:String
     },
     email:{
        type:String,
        unique:true,
        index:true
     },
     profilePic:{
        type:String,
        default:""
     }
},{timestamps:true})

userSchema.pre("save", async function(next) {
   if (!this.isModified("password")) return next();
   try {
       this.password = await bcrypt.hash(this.password, 10);
       next();
   } catch (err) {
       next(new HttpError("An error occured", 500));
   }
});

userSchema.methods.isPasswordCorrect=async function(password){
   return await bcrypt.compare(password,this.password)
}

const User= mongoose.model("User",userSchema)


export default User