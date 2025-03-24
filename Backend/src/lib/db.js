import mongoose from 'mongoose'

const connectDb=async ()=>{
    try {
        mongoose.connect(process.env.MONGODB_URL)
        console.log("Mongo DB connected Successfully")
    } catch (error) {
        console.log(error)
    }
}
export default connectDb