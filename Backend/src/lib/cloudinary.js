import dotenv from 'dotenv';
dotenv.config();
import {v2 as cloudinary} from 'cloudinary'

cloudinary.config(
    {
        cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
        api_key:process.env.CLOUDINARY_API_KEY,
        api_secret:process.env.CLOUDINARY_API_SECRET

    }
)

const uploadToCloudinary = async (fileBuffer) => {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { resource_type: 'image' },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
  
      stream.end(fileBuffer); // Push buffer to stream
    });
  };
export default cloudinary
export {uploadToCloudinary}