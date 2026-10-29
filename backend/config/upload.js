import multer from "multer";
import path from "path";
import crypto from "crypto";

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },

    filename: (req, file, cb) => {
        const uniqueName = crypto.randomUUID();

        cb(null, uniqueName + path.extname(file.originalname));
    }
});

const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp"
];

const upload = multer({
    storage,

    limits: {
        fileSize: 5 * 1024 * 1024
    },

    fileFilter: (req, file, cb) => {
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("Only JPEG, PNG and WebP images are allowed"));
        }
    }
});

export default upload;