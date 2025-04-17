const express = require('express');
const { generateImage, uploadToPinata, fetchImage } = require('../controller/imageController');
const router = express.Router();
 
router.post('/generate', generateImage);
router.post('/upload-to-pinata', uploadToPinata);
router.get('/fetch-image', fetchImage);
 
module.exports = router;