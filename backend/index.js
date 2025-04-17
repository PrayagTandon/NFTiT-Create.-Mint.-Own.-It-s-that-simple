require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const imageRoutes = require('./routes/imageRoute');
const ipfsRoutes = require('./routes/ipfsRoutes');
const nftRoutes = require('./routes/nftRoutes');
const aiUploadRoutes = require('./routes/aiUploadRoutes');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// Routes
app.use('/api', imageRoutes);
app.use('/api/ipfs', ipfsRoutes);
app.use('/api/nft', nftRoutes);
app.use('/api/ai-upload', aiUploadRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        error: err.message
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
