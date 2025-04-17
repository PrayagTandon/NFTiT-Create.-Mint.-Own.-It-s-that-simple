const axios = require('axios');

// Use Pinata gateway for metadata retrieval
const PINATA_GATEWAY = 'https://gateway.pinata.cloud/ipfs/';

async function getMetadata(req, res) {
    try {
        const { cid } = req.params;

        // Validate CID format
        if (!cid || !/^Qm[1-9A-Za-z]{44}$/.test(cid)) {
            return res.status(400).json({ error: "Invalid IPFS CID format" });
        }

        // Fetch metadata from IPFS
        const response = await axios.get(`${PINATA_GATEWAY}${cid}`);

        // Validate JSON structure
        try {
            const metadata = response.data;
            if (!metadata.name || !metadata.image) {
                throw new Error('Invalid metadata format');
            }
            res.json(metadata);
        } catch (parseError) {
            res.status(400).json({ error: "Invalid metadata format" });
        }
    } catch (error) {
        console.error('Metadata fetch error:', error);
        res.status(500).json({
            error: error.response?.data?.error?.message || 'Failed to fetch metadata'
        });
    }
}

module.exports = { getMetadata };