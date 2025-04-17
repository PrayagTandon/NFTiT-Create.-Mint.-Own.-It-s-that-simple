const express = require('express');
const router = express.Router();
const { getMetadata } = require('../controller/metadatacontroller');

router.get('/:cid', getMetadata);

module.exports = router;