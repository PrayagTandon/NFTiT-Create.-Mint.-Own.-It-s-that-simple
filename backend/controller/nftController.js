const { ethers } = require('ethers');
const { AIBL_NFT_ADDRESS, AIBL_NFT_ABI, NETWORKS } = require('../config/contractConfig');

const mintNFT = async (req, res) => {
    try {
        const { cid, blockchain, walletAddress } = req.body;

        // Validate CID matches Pinata format
        if (!cid || !/^Qm[1-9A-Za-z]{44}$/.test(cid)) {
            return res.status(400).json({ error: "Invalid IPFS CID format" });
        }

        // Validate blockchain network
        if (!NETWORKS[blockchain]) {
            return res.status(400).json({ error: "Unsupported blockchain network" });
        }

        // Setup provider and contract
        const provider = new ethers.JsonRpcProvider(NETWORKS[blockchain].rpcUrl);
        const contract = new ethers.Contract(AIBL_NFT_ADDRESS, AIBL_NFT_ABI, provider);

        // Create IPFS URI (using pinata gateway)
        const tokenURI = `ipfs://${cid}`;

        // Estimate gas with buffer
        const gasEstimate = await contract.safeMintTo.estimateGas(
            walletAddress,
            tokenURI
        );
        const gasPrice = await provider.getGasPrice();

        res.json({
            to: AIBL_NFT_ADDRESS,
            data: contract.interface.encodeFunctionData('safeMintTo', [
                walletAddress,
                tokenURI
            ]),
            gasLimit: Math.floor(gasEstimate * 1.2).toString(),
            gasPrice: gasPrice.toString(),
            chainId: NETWORKS[blockchain].chainId
        });
    } catch (error) {
        console.error('Mint error:', error);
        res.status(500).json({
            error: error.reason || error.message,
            code: error.code
        });
    }
};

module.exports = { mintNFT };