import multer from "multer"

const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png'];

const fileUpload = multer({
    limits: {fileSize: 5*1024*1024,fieldSize: 10 * 1024 * 1024}, // 1 MB
    storage: multer.memoryStorage(),
    fileFilter: (req, file, cb) =>{
        if(allowedMimeTypes.includes(file.mimetype)){
            cb(null, true)
        }else{
            cb(new Error('Invalid file type. Only JPEG, JPG, and PNG are allowed!'), false)
        }
    }
})

export default fileUpload