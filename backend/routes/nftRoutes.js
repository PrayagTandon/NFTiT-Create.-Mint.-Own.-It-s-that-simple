const express = require('express');
const router = express.Router();
const { mintNFT } = require('../controller/nftController');

router.post('/mint', mintNFT);

module.exports = router;