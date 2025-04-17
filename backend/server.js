require('dotenv').config();
const express = require('express');
const cors = require('cors');
const ipfsRoutes = require('./routes/ipfsRoutes');
const nftRoutes = require('./routes/nftRoutes');
const metadataRoutes = require('./routes/metadataroutes');

const app = express();

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
}));
app.use(express.json({ limit: '50mb' }));
app.use('/api/metadata', metadataRoutes);

// Routes
app.use('/api/ipfs', ipfsRoutes);
app.use('/api/nft', nftRoutes);

// Health check
app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: process.env.NODE_ENV === 'production' ? 'Server error' : err.message
    });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, '0.0.0.0', () =>
    console.log(`Server running on port ${PORT}`));