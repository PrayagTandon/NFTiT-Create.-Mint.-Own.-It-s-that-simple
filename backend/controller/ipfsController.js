const axios = require('axios');
const FormData = require('form-data');

// Pinata API configuration
const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_SECRET_API_KEY = process.env.PINATA_SECRET_API_KEY;
const PINATA_GATEWAY = 'https://gateway.pinata.cloud/ipfs/';

// Function to upload file to IPFS via Pinata
async function uploadToIPFS(file) {
    try {
        if (!PINATA_API_KEY || !PINATA_SECRET_API_KEY) {
            throw new Error('Pinata API credentials are missing. Please check your .env file.');
        }

        if (!file || !file.buffer) {
            throw new Error('Invalid file object');
        }

        const formData = new FormData();
        formData.append('file', file.buffer, {
            filename: file.originalname,
            contentType: file.mimetype
        });

        console.log('Uploading file to Pinata:', {
            filename: file.originalname,
            size: file.size,
            type: file.mimetype
        });

        const response = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', formData, {
            maxBodyLength: 'Infinity',
            headers: {
                'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
                'pinata_api_key': PINATA_API_KEY,
                'pinata_secret_api_key': PINATA_SECRET_API_KEY
            }
        });

        console.log('Pinata response:', response.data);

        return {
            cid: response.data.IpfsHash,
            url: `${PINATA_GATEWAY}${response.data.IpfsHash}`
        };
    } catch (error) {
        console.error('Error uploading to IPFS:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
        });

        // Handle specific error cases
        if (error.response?.status === 403) {
            if (error.response?.data?.error?.reason === 'API_KEY_REVOKED') {
                throw new Error('Your Pinata API key has been revoked. Please generate new API keys and update your .env file.');
            }
            throw new Error('Invalid Pinata API credentials. Please check your .env file.');
        }

        throw new Error(error.response?.data?.error?.details || 'Failed to upload file to IPFS');
    }
}

// Controller function to handle file upload
async function uploadFile(req, res) {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No file uploaded'
            });
        }

        console.log('Received file:', {
            originalname: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size
        });

        const result = await uploadToIPFS(req.file);

        res.json({
            success: true,
            cid: result.cid,
            url: result.url
        });
    } catch (error) {
        console.error('Error in uploadFile controller:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}

module.exports = {
    uploadFile
}; 