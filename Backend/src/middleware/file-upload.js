import multer from "multer";

const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

const fileUpload = multer({
    limits: {
        fileSize: 5 * 1024 * 1024, // 5 MB
        fieldSize: 10 * 1024 * 1024
    },
    storage: multer.memoryStorage(),
    fileFilter: (req, file, cb) => {
        if (allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only JPEG, JPG, PNG, and WEBP are allowed!'), false);
        }
    }
});

export default fileUpload;
