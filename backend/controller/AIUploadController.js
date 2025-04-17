const OpenAI = require('openai');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Ensure temp directory exists
const tempDir = path.join(__dirname, '..', 'temp');
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
}

/**
 * Fetch an image from a URL
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const fetchImage = async (req, res) => {
    const { imageUrl } = req.query;

    if (!imageUrl) {
        return res.status(400).json({ error: 'Image URL is required' });
    }

    try {
        const response = await axios.get(imageUrl, { responseType: 'stream' });
        res.setHeader('Content-Type', response.headers['content-type']);
        response.data.pipe(res);
    } catch (error) {
        console.error('Fetch Image Error:', error.message);
        res.status(500).json({ error: error.message });
    }
};

/**
 * Upload the transformed image to Pinata IPFS
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const uploadToPinata = async (req, res) => {
    let tempFilePath = null;
    let jsonFilePath = null;

    try {
        const { imageUrl, prompt, title } = req.body;

        if (!imageUrl) {
            return res.status(400).json({ error: 'Image URL is required.' });
        }

        // Fetch the image from the URL
        const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        const imageBuffer = Buffer.from(imageResponse.data);

        // Create a temporary file
        tempFilePath = path.join(tempDir, `pinata_${Date.now()}.png`);
        fs.writeFileSync(tempFilePath, imageBuffer);

        // Prepare form data for Pinata
        const formData = new FormData();
        formData.append('file', fs.createReadStream(tempFilePath));

        // Add metadata
        const metadata = JSON.stringify({
            name: title || 'AI Transformed Image',
            description: prompt || 'AI transformed image',
            keyvalues: {
                uploadedBy: 'AIBL',
            },
        });
        formData.append('pinataMetadata', metadata);

        // Add options
        const options = JSON.stringify({
            cidVersion: 0,
        });
        formData.append('pinataOptions', options);

        // Upload to Pinata
        const pinataResponse = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', formData, {
            maxBodyLength: 'Infinity',
            headers: {
                ...formData.getHeaders(),
                pinata_api_key: process.env.PINATA_API_KEY,
                pinata_secret_api_key: process.env.PINATA_SECRET_API_KEY,
            },
        });

        // Create metadata JSON for the NFT
        const nftMetadata = {
            name: title || 'AI Transformed Image',
            description: prompt || 'AI transformed image',
            image: `https://ipfs.io/ipfs/${pinataResponse.data.IpfsHash}`,
        };

        // Upload metadata JSON to Pinata
        const jsonFormData = new FormData();
        const jsonBuffer = Buffer.from(JSON.stringify(nftMetadata));
        jsonFilePath = path.join(tempDir, `metadata_${Date.now()}.json`);
        fs.writeFileSync(jsonFilePath, jsonBuffer);

        jsonFormData.append('file', fs.createReadStream(jsonFilePath));
        jsonFormData.append('pinataMetadata', JSON.stringify({
            name: 'NFT Metadata',
            keyvalues: {
                uploadedBy: 'AIBL',
            },
        }));
        jsonFormData.append('pinataOptions', JSON.stringify({
            cidVersion: 0,
        }));

        const jsonPinataResponse = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', jsonFormData, {
            maxBodyLength: 'Infinity',
            headers: {
                ...jsonFormData.getHeaders(),
                pinata_api_key: process.env.PINATA_API_KEY,
                pinata_secret_api_key: process.env.PINATA_SECRET_API_KEY,
            },
        });

        res.status(200).json({
            imageIpfsUrl: `https://ipfs.io/ipfs/${pinataResponse.data.IpfsHash}`,
            metadataIpfsUrl: `https://ipfs.io/ipfs/${jsonPinataResponse.data.IpfsHash}`,
            metadata: nftMetadata
        });
    } catch (error) {
        console.error('Pinata Upload Error:', error.message);
        res.status(500).json({ error: error.message });
    } finally {
        // Clean up temporary files
        try {
            if (tempFilePath && fs.existsSync(tempFilePath)) {
                fs.unlinkSync(tempFilePath);
            }
            if (jsonFilePath && fs.existsSync(jsonFilePath)) {
                fs.unlinkSync(jsonFilePath);
            }
        } catch (cleanupError) {
            console.error('Error cleaning up temporary files:', cleanupError.message);
        }
    }
};

module.exports = { uploadToPinata, fetchImage }; 