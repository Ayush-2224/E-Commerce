import mongoose from 'mongoose'
import bcrypt from'bcryptjs'
const userSchema =mongoose.Schema({
     username:{
        type:String,
        lowercase:true,
        trim: true,
       
     },
     password:{
        type:String,
        unique:true,
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

userSchema.pre("save",async function(next){
    if(!this.isModified("password")) return next();
     this.password=await bcrypt.hash(this.password,10)
     next()
})

userSchema.methods.isPasswordCorrect=async function(password){
   return await bcrypt.compare(password,this.password)
}

const User= mongoose.model("User",userSchema)


export default User