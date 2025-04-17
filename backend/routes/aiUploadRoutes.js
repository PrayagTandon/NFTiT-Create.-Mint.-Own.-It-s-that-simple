const express = require('express');
const { uploadToPinata, fetchImage } = require('../controller/AIUploadController');
const router = express.Router();

// Route for uploading the transformed image to Pinata
router.post('/upload-to-pinata', uploadToPinata);

// Route for fetching an image from a URL
router.get('/fetch-image', fetchImage);

module.exports = router; 