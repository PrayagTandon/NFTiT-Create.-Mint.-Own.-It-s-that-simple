const express = require('express');
const router = express.Router();
const multer = require('multer');
const { uploadFile } = require('../Controller/ipfsController');

// Configure multer for memory storage
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB limit
    },
    fileFilter: (req, file, cb) => {
        // Accept images, audio, and video files
        const allowedTypes = [
            'image/jpeg',
            'image/png',
            'image/gif',
            'audio/mpeg',
            'audio/mp3',
            'video/mp4',
            'video/quicktime'
        ];

        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only images, audio, and video files are allowed.'));
        }
    }
});

// Route to handle file upload
router.post('/upload', upload.single('file'), uploadFile);

module.exports = router; 