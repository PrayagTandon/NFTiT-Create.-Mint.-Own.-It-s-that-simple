import React, { useState, useRef } from 'react';
import OpenAI from "openai";
import { ethers } from 'ethers';
import { ImageNFT } from '../config';
import imagesmint from '../ImageNFT.json';
import { Box, Button, TextField, Typography, CircularProgress, Paper, Grid } from '@mui/material';
import { styled } from '@mui/material/styles';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import TokenIcon from '@mui/icons-material/Token';
import StorageIcon from '@mui/icons-material/Storage';

const openai = new OpenAI({
    apiKey: process.env.REACT_APP_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true
});

const Input = styled('input')({
    display: 'none',
});

const AIUploadPage = () => {
    console.log("AIUploadPage component rendering");
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [prompt, setPrompt] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [generatedImage, setGeneratedImage] = useState(null);
    const [error, setError] = useState(null);
    const [walletAddress, setWalletAddress] = useState('');
    const [isUploadingToPinata, setIsUploadingToPinata] = useState(false);
    const [isMinting, setIsMinting] = useState(false);
    const [ipfsUrl, setIpfsUrl] = useState('');
    const [title, setTitle] = useState('');
    const fileInputRef = useRef(null);

    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (file && file.type.startsWith('image/')) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!selectedFile || !prompt.trim()) {
            setError('Please select an image and enter a prompt');
            return;
        }

        setIsUploading(true);
        setError(null);

        try {
            // Extract base64 image from preview URL
            const base64Image = previewUrl.split(',')[1];

            console.log('Sending request to OpenAI...');

            // First, use GPT-4o (which has vision capabilities) to understand the image and generate a detailed description
            const visionResponse = await openai.chat.completions.create({
                model: "gpt-4o",
                messages: [
                    {
                        role: "user",
                        content: [
                            { type: "text", text: `Look at this image and follow these instructions: ${prompt}. Based on this image, describe in great detail how this image would look with the requested style transformation.` },
                            {
                                type: "image_url",
                                image_url: {
                                    url: `data:image/jpeg;base64,${base64Image}`
                                }
                            }
                        ]
                    }
                ],
                max_tokens: 1000
            });

            console.log('Vision API Response:', visionResponse);

            // Extract the detailed description
            const detailedDescription = visionResponse.choices[0].message.content;

            // Now use DALL-E to generate a new image based on the detailed description
            const dalleResponse = await openai.images.generate({
                model: "dall-e-3",
                prompt: `Create a new image that looks like this: ${detailedDescription}. Apply the following style transformation: ${prompt}.`,
                n: 1,
                size: "1024x1024",
                response_format: "url",
            });

            console.log('DALL-E Response:', dalleResponse);
            if (dalleResponse.data && dalleResponse.data.length > 0) {
                setGeneratedImage(dalleResponse.data[0].url);
            } else {
                throw new Error('Invalid response format from OpenAI');
            }
        } catch (error) {
            console.error('Error processing image:', error);
            setError(`API Error: ${error.message}` || 'Failed to process image. Please try again.');
        } finally {
            setIsUploading(false);
        }
    };

    const handleDownload = () => {
        if (generatedImage) {
            const link = document.createElement('a');
            link.href = generatedImage;
            link.download = 'edited-image.png';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const handleReset = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
        setPrompt('');
        setGeneratedImage(null);
        setError(null);
        setIpfsUrl('');
        setTitle('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const connectWallet = async () => {
        if (window.ethereum) {
            try {
                // Request wallet connection
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                setWalletAddress(accounts[0]);

                // Check and switch to Polygon Amoy network
                const AMOY_CHAIN_ID = '0x13882'; // Correct hexadecimal chain ID for 80002
                const network = await window.ethereum.request({ method: 'eth_chainId' });

                if (network !== AMOY_CHAIN_ID) {
                    try {
                        // Switch to Amoy network
                        await window.ethereum.request({
                            method: 'wallet_switchEthereumChain',
                            params: [{ chainId: AMOY_CHAIN_ID }],
                        });
                        console.log("Switched to Amoy network.");
                    } catch (switchError) {
                        if (switchError.code === 4902) {
                            try {
                                await window.ethereum.request({
                                    method: 'wallet_addEthereumChain',
                                    params: [
                                        {
                                            chainId: AMOY_CHAIN_ID,
                                            rpcUrls: ['https://rpc-amoy.polygon.technology/'],
                                            chainName: 'Polygon Amoy Testnet',
                                            nativeCurrency: {
                                                name: 'MATIC',
                                                symbol: 'MATIC',
                                                decimals: 18,
                                            },
                                            blockExplorerUrls: ['https://amoy.polygonscan.com/'],
                                        },
                                    ],
                                });
                                console.log("Amoy network added and switched.");
                            } catch (addError) {
                                console.error("Failed to add Amoy network:", addError);
                                alert("Please manually add the Amoy network to MetaMask.");
                                return;
                            }
                        } else {
                            console.error("Failed to switch to Amoy network:", switchError);
                            alert("Please manually switch to the Amoy network.");
                            return;
                        }
                    }
                }
            } catch (error) {
                console.error('Wallet connection failed:', error);
            }
        } else {
            alert('MetaMask is not installed. Please install it to use this feature.');
        }
    };

    const handleUploadToPinata = async () => {
        if (!generatedImage) {
            alert('No image generated to upload.');
            return;
        }

        setIsUploadingToPinata(true);
        try {
            // Send the image URL and metadata to the backend for Pinata upload
            const response = await fetch('http://localhost:5000/api/ai-upload/upload-to-pinata', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    imageUrl: generatedImage,
                    prompt: prompt,
                    title: title || 'AI Transformed Image'
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to upload to Pinata');
            }

            const data = await response.json();
            setIpfsUrl(data.metadataIpfsUrl);
            alert(`Metadata JSON uploaded to IPFS: ${data.metadataIpfsUrl}`);
        } catch (error) {
            console.error('Upload to Pinata Error:', error.message);
            alert('An error occurred while uploading the JSON to Pinata.');
        } finally {
            setIsUploadingToPinata(false);
        }
    };

    const mintNFT = async () => {
        if (!ipfsUrl) {
            alert('Please upload to Pinata first.');
            return;
        }

        if (!walletAddress) {
            await connectWallet();
        }

        setIsMinting(true);
        try {
            // Check if Ethereum object is present in the window (MetaMask or other wallet)
            const { ethereum } = window;
            if (ethereum) {
                // Create a Web3 provider from the Ethereum object
                const provider = new ethers.BrowserProvider(ethereum);

                // Request account access
                await provider.send("eth_requestAccounts", []);

                // Get the signer (the user's wallet address)
                const signer = await provider.getSigner();
                console.log("Signer:", signer);

                // Create the contract instance with the signer and ABI
                const nftContract = new ethers.Contract(ImageNFT, imagesmint, signer);
                console.log("IPFS URL for minting:", ipfsUrl);

                // Call the safeMint function to mint the NFT
                const tx = await nftContract.safeMint(ipfsUrl, {
                    gasPrice: 31000000000,
                    gasLimit: 1000000
                });

                // Wait for the transaction to be mined
                const receipt = await tx.wait();
                console.log("NFT Minted! Transaction receipt:", receipt);
                alert(`NFT successfully minted! Transaction hash: ${receipt.hash}`);
            } else {
                console.error("Ethereum object does not exist. Please install MetaMask or another Ethereum wallet.");
                alert("Please install MetaMask or another Ethereum wallet.");
            }
        } catch (error) {
            console.error("Error while minting NFT:", error);
            alert(`Error minting NFT: ${error.message}`);
        } finally {
            setIsMinting(false);
        }
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                background: '#121212',
                padding: '2rem',
                color: 'white',
            }}
        >
            <Paper
                elevation={3}
                sx={{
                    maxWidth: '900px',
                    margin: '0 auto',
                    padding: '2rem',
                    background: '#1e1e1e',
                    borderRadius: '12px',
                }}
            >
                <Typography variant="h4" sx={{ mb: 4, color: '#90caf9', textAlign: 'center' }}>
                    AI Image Transformer
                </Typography>

                {error && (
                    <Typography color="error" sx={{ mb: 4 }}>
                        {error}
                    </Typography>
                )}

                <form onSubmit={handleUpload}>
                    <Grid container spacing={4}>
                        <Grid item xs={12} md={generatedImage ? 6 : 12}>
                            {/* Image Upload Section */}
                            <Box sx={{ mb: 4 }}>
                                <Typography variant="h6" sx={{ mb: 2, color: '#90caf9' }}>
                                    Original Image
                                </Typography>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileSelect}
                                    ref={fileInputRef}
                                    style={{ display: 'none' }}
                                />
                                <Button
                                    variant="outlined"
                                    component="label"
                                    startIcon={<CloudUploadIcon />}
                                    sx={{
                                        color: '#90caf9',
                                        borderColor: '#90caf9',
                                        '&:hover': {
                                            borderColor: '#64b5f6',
                                            background: 'rgba(144, 202, 249, 0.1)',
                                        },
                                        mb: 2,
                                    }}
                                >
                                    Select Image
                                    <input
                                        type="file"
                                        hidden
                                        accept="image/*"
                                        onChange={handleFileSelect}
                                    />
                                </Button>
                                {selectedFile && (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                        <Typography variant="body1">{selectedFile.name}</Typography>
                                        <Button
                                            startIcon={<DeleteIcon />}
                                            onClick={() => {
                                                setSelectedFile(null);
                                                setPreviewUrl(null);
                                                if (fileInputRef.current) {
                                                    fileInputRef.current.value = '';
                                                }
                                            }}
                                            sx={{
                                                color: '#90caf9',
                                                '&:hover': {
                                                    background: 'rgba(144, 202, 249, 0.1)',
                                                },
                                            }}
                                        >
                                            Remove
                                        </Button>
                                    </Box>
                                )}
                                {previewUrl && (
                                    <Box
                                        component="img"
                                        src={previewUrl}
                                        alt="Preview"
                                        sx={{
                                            width: '100%',
                                            height: '300px',
                                            borderRadius: '8px',
                                            objectFit: 'contain',
                                        }}
                                    />
                                )}
                            </Box>

                            {/* Title Input */}
                            <TextField
                                fullWidth
                                label="Image Title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                sx={{
                                    mb: 2,
                                    '& .MuiOutlinedInput-root': {
                                        color: 'white',
                                        '& fieldset': {
                                            borderColor: '#90caf9',
                                        },
                                        '&:hover fieldset': {
                                            borderColor: '#64b5f6',
                                        },
                                    },
                                    '& .MuiInputLabel-root': {
                                        color: 'white',
                                    },
                                }}
                            />

                            {/* Prompt Input */}
                            <TextField
                                fullWidth
                                label="Enter style transformation prompt (e.g., 'Convert to Studio Ghibli style')"
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                multiline
                                rows={4}
                                sx={{
                                    mb: 4,
                                    '& .MuiOutlinedInput-root': {
                                        color: 'white',
                                        '& fieldset': {
                                            borderColor: '#90caf9',
                                        },
                                        '&:hover fieldset': {
                                            borderColor: '#64b5f6',
                                        },
                                    },
                                    '& .MuiInputLabel-root': {
                                        color: 'white',
                                    },
                                }}
                            />

                            {/* Action Buttons */}
                            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mb: 4 }}>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    disabled={isUploading || !selectedFile || !prompt.trim()}
                                    sx={{
                                        background: '#90caf9',
                                        '&:hover': {
                                            background: '#64b5f6',
                                        },
                                        minWidth: '120px',
                                    }}
                                >
                                    {isUploading ? <CircularProgress size={24} /> : 'Transform Image'}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outlined"
                                    onClick={handleReset}
                                    sx={{
                                        color: '#90caf9',
                                        borderColor: '#90caf9',
                                        '&:hover': {
                                            borderColor: '#64b5f6',
                                            background: 'rgba(144, 202, 249, 0.1)',
                                        },
                                        minWidth: '120px',
                                    }}
                                >
                                    Reset
                                </Button>
                            </Box>
                        </Grid>

                        {/* Generated Image Preview */}
                        {generatedImage && (
                            <Grid item xs={12} md={6}>
                                <Box sx={{ mb: 4 }}>
                                    <Typography variant="h6" sx={{ mb: 2, color: '#90caf9' }}>
                                        Transformed Image
                                    </Typography>
                                    <Box
                                        component="img"
                                        src={generatedImage}
                                        alt="Generated"
                                        sx={{
                                            width: '100%',
                                            height: '300px',
                                            borderRadius: '8px',
                                            objectFit: 'contain',
                                            mb: 2,
                                        }}
                                    />
                                    <Button
                                        variant="outlined"
                                        startIcon={<DownloadIcon />}
                                        onClick={handleDownload}
                                        sx={{
                                            color: '#90caf9',
                                            borderColor: '#90caf9',
                                            '&:hover': {
                                                borderColor: '#64b5f6',
                                                background: 'rgba(144, 202, 249, 0.1)',
                                            },
                                        }}
                                    >
                                        Download Image
                                    </Button>
                                </Box>
                            </Grid>
                        )}
                    </Grid>
                </form>

                {/* Blockchain Actions */}
                {generatedImage && (
                    <>
                        <Box sx={{ mt: 4, textAlign: 'center' }}>
                            <Button
                                variant="contained"
                                startIcon={<StorageIcon />}
                                onClick={handleUploadToPinata}
                                disabled={isUploadingToPinata || !generatedImage}
                                sx={{
                                    background: 'linear-gradient(45deg, #90caf9 30%, #64b5f6 90%)',
                                    '&:hover': {
                                        background: 'linear-gradient(45deg, #64b5f6 30%, #42a5f5 90%)',
                                    },
                                    minWidth: '180px',
                                }}
                            >
                                {isUploadingToPinata ? <CircularProgress size={24} /> : 'Upload to Pinata'}
                            </Button>
                        </Box>

                        {walletAddress && (
                            <Typography variant="body2" sx={{ textAlign: 'center', color: '#90caf9' }}>
                                Connected Wallet: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                            </Typography>
                        )}

                        {!walletAddress && (
                            <Box sx={{ textAlign: 'center' }}>
                                <Button
                                    variant="outlined"
                                    onClick={connectWallet}
                                    sx={{
                                        color: '#90caf9',
                                        borderColor: '#90caf9',
                                        '&:hover': {
                                            borderColor: '#64b5f6',
                                            background: 'rgba(144, 202, 249, 0.1)',
                                        },
                                    }}
                                >
                                    Connect Wallet
                                </Button>
                            </Box>
                        )}

                        {ipfsUrl && (
                            <Box sx={{ mt: 2, textAlign: 'center' }}>
                                <Typography variant="body2">
                                    IPFS URL: {ipfsUrl}
                                </Typography>
                                <Button
                                    variant="contained"
                                    startIcon={<TokenIcon />}
                                    onClick={mintNFT}
                                    disabled={isMinting || !ipfsUrl}
                                    sx={{ mt: 1 }}
                                >
                                    {isMinting ? <CircularProgress size={24} /> : 'Mint NFT'}
                                </Button>
                            </Box>
                        )}
                    </>
                )}
            </Paper>
        </Box>
    );
};

export default AIUploadPage; 