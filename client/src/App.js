import './App.css';
import React, { useState } from 'react';
import { Box, Typography, TextField, Button, ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { PinataSDK } from "pinata-web3";
import { ImageNFT } from './config.js';
import imagesmint from './ImageNFT.json'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AppDrawer from './components/AppDrawer';
import IPFSPage from './pages/IPFSPage';
import MintNFTPage from './pages/MintNFTPage';
import AIUploadPage from './pages/AIUploadPage';
const { ethers, Result } = require("ethers");

// Create dark theme
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
    },
    secondary: {
      main: '#f48fb1',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          padding: '8px 24px',
          fontWeight: 600,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
  },
});

function MainContent() {
  // State to hold the input value
  const [prompt, setPrompt] = useState('');
  const [ImageUrl, setImageUrl] = useState(null);  // State to hold the image
  const [generatedImage, setGeneratedImage] = useState('null');
  const [title, setTitle] = useState('');
  const [cid, setCID] = useState('');
  const [mintDisabled, setMintDisabled] = useState(true);
  const [walletAddress, setWalletAddress] = useState('');
  var jsonIpfsUrl;

  var imgUrl, link;


  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        // Request wallet connection
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setWalletAddress(accounts[0]);
        const AMOY_CHAIN_ID = '0x13882'; // Correct hexadecimal chain ID for 80002
        const AMOY_RPC_URL = 'https://rpc-amoy.polygon.technology/';
        const AMOY_CHAIN_NAME = 'Polygon Amoy Testnet';
        const AMOY_CURRENCY_SYMBOL = 'MATIC';
        const AMOY_BLOCK_EXPLORER_URL = 'https://amoy.polygonscan.com/';

        // Check and switch to Sepolia network
        const network = await window.ethereum.request({ method: 'eth_chainId' });
        if (network !== AMOY_CHAIN_ID) {
          try {
            // Switch to Amoy network
            await window.ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: AMOY_CHAIN_ID }],
            });
            console.log("Switched to Amoy network.");

            console.log("Connection successful");
          }
          catch (switchError) {
            if (switchError.code == 4902) {
              try {
                await window.ethereum.request({
                  method: 'wallet_addEthereumChain',
                  params: [
                    {
                      chainId: AMOY_CHAIN_ID,
                      rpcUrls: [AMOY_RPC_URL],
                      chainName: AMOY_CHAIN_NAME,
                      nativeCurrency: {
                        name: 'MATIC',
                        symbol: AMOY_CURRENCY_SYMBOL,
                        decimals: 18,
                      },
                      blockExplorerUrls: ['https://amoy.polygonscan.com/'], // Update if there's a specific Amoy block explorer
                    },
                  ],
                });
                console.log("Amoy network added and switched.");
              }
              catch (addError) {
                console.error("Failed to add Amoy network:", addError);
                alert("Please manually add the Amoy network to MetaMask.");
                return;
              }
            }
            else {
              console.error("Failed to switch to Amoy network:", switchError);
              alert("Please manually switch to the Amoy network.");
              return;
            }
            console.error('Error switching to the Amoy network:', switchError);
          }
        }
      } catch (error) {
        console.error('Wallet connection failed:', error);
      }
    } else {
      alert('MetaMask is not installed. Please install it to use this feature.');
    }
  };


  // Backend Function call
  async function generateImage(prompt) {
    try {
      const response = await fetch('http://localhost:5000/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      if (response.ok) {
        const data = await response.json();
        setGeneratedImage(data.image_url);
      } else {
        const errorData = await response.json();
        console.error('Error:', errorData);
      }
    } catch (error) {
      console.error('Error:', error.message);
    }
  }





  const handleGenerateClick = () => {
    if (prompt.trim()) {
      generateImage(prompt);
    } else {
      alert('Please enter a prompt!');
    }
  };
  const handleUploadToPinata = async () => {
    if (!generatedImage) {
      alert('No image generated to upload.');
      return;
    }

    try {

      const pinata = new PinataSDK({
        pinataJwt: process.env.REACT_APP_PINATA_JWT,
        pinataGateway: 'white-bright-ermine-612.mypinata.cloud',
      });

      const proxiedImageResponse = await fetch(
        `http://localhost:5000/api/fetch-image?imageUrl=${encodeURIComponent(generatedImage)}`
      );
      if (!proxiedImageResponse.ok) {
        throw new Error('Failed to fetch the image through proxy.');
      }

      const blob = await proxiedImageResponse.blob();
      const file = new File([blob], 'generated_images.png', { type: blob.type });

      const pinataImageUploadResponse = await pinata.upload.file(file);
      const imageIpfsUrl = `https:///white-bright-ermine-612.mypinata.cloud/ipfs/${pinataImageUploadResponse.IpfsHash}`;

      const metadata = {
        name: `Digital Prompt Art `,
        description: prompt,
        image: imageIpfsUrl,
      };
      const jsonBlob = new Blob([JSON.stringify(metadata)], { type: 'application/json' });
      const jsonFile = new File([jsonBlob], 'metadata.json', { type: 'application/json' });

      const pinataJsonUploadResponse = await pinata.upload.file(jsonFile);
      jsonIpfsUrl = `https://white-bright-ermine-612.mypinata.cloud/ipfs/${pinataJsonUploadResponse.IpfsHash}`;
      alert(`Metadata JSON uploaded to IPFS: ${jsonIpfsUrl}`);
    } catch (error) {
      console.error('Upload to Pinata Error:', error.message);
      alert('An error occurred while uploading the JSON to Pinata.');
    }
  };


  const handleDownloadImage = () => {
    if (generatedImage) {
      const link = document.createElement('a');
      link.href = generatedImage;
      link.download = 'generated_image.png';
      link.click();
    }
  };


  const mintNFT = async () => {
    connectWallet();
    connectWallet();
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
        console.log("Signer:", signer)

        // Log the contract ABI and signer for debugging
        console.log(imagesmint, signer);



        // Call the safeMint function to mint the NFT
        // Create the contract instance with the signer and ABI
        const imagenft = new ethers.Contract(ImageNFT, imagesmint, signer);
        console.log(jsonIpfsUrl);
        //const gasLimit = await imagenft.estimateGas.safeMint(jsonIpfsUrl);
        //console.log("Gas Limit Estimated:", gasLimit.toString());

        // Call the safeMint function to mint the NFT (pass JSON IPFS URL)
        console.log(jsonIpfsUrl)
        const tx = await imagenft.safeMint(jsonIpfsUrl, {
          gasPrice: 31000000000,
          gasLimit: 1000000
        });

        // Wait for the transaction to be mined
        const receipt = await tx.wait();
        console.log("NFT Minted! Transaction receipt:", receipt);

      } else {
        console.error("Ethereum object does not exist. Please install MetaMask or another Ethereum wallet.");
      }
    } catch (error) {
      console.error("Error while minting NFT:", error);
    }
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box
        className="app"
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #121212 0%, #1e1e1e 100%)',
          padding: '2rem',
          color: 'white',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {/* Connect Wallet Button */}
        <Button
          variant="contained"
          color="primary"
          onClick={connectWallet}
          sx={{
            position: 'fixed',
            top: '24px',
            right: '24px',
            background: 'linear-gradient(45deg, #90caf9 30%, #64b5f6 90%)',
            boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
            '&:hover': {
              background: 'linear-gradient(45deg, #64b5f6 30%, #42a5f5 90%)',
            },
            zIndex: 1000,
          }}
        >
          {walletAddress ? `Connected: ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : 'Connect Wallet'}
        </Button>

        <Typography
          variant="h4"
          component="h1"
          className="header"
          sx={{
            textAlign: 'center',
            marginTop: '2rem',
            marginBottom: '3rem',
            background: 'linear-gradient(45deg, #90caf9 30%, #64b5f6 90%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 'bold',
            fontSize: { xs: '2rem', md: '2.5rem' },
          }}
        >
          <p>AIBL <br />
            (Where AI's creativity meets Blockchain security)</p>
        </Typography>

        {/* Text Box */}
        <Box
          sx={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'center',
            marginBottom: '3rem',
            width: '100%',
            maxWidth: '800px',
            position: 'relative',
          }}
        >
          <TextField
            variant="outlined"
            placeholder="Write a Prompt to generate an image"
            className="textBox"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            sx={{
              width: '70%',
              '& .MuiOutlinedInput-root': {
                '&:hover fieldset': {
                  borderColor: '#90caf9',
                },
              },
            }}
          />
          <Button
            variant="contained"
            onClick={handleGenerateClick}
            sx={{
              background: 'linear-gradient(45deg, #90caf9 30%, #64b5f6 90%)',
              boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
              '&:hover': {
                background: 'linear-gradient(45deg, #64b5f6 30%, #42a5f5 90%)',
              },
              minWidth: '120px',
            }}
          >
            Generate
          </Button>
        </Box>

        {/* Main Content Area */}
        <Box
          sx={{
            width: '100%',
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: '2rem',
            alignItems: 'flex-start',
          }}
        >
          {/* Left Section: Image */}
          <Box
            sx={{
              flex: { xs: '1', md: '1' },
              width: '100%',
              maxWidth: { xs: '100%', md: '500px' },
              position: 'sticky',
              top: '100px',
            }}
          >
            {generatedImage ? (
              <img
                src={generatedImage}
                alt="Generated"
                style={{
                  width: '100%',
                  height: 'auto',
                  borderRadius: '12px',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
                }}
              />
            ) : (
              <Typography
                variant="body1"
                color="textSecondary"
                textAlign="center"
                sx={{
                  padding: '2rem',
                  background: 'rgba(0, 0, 0, 0.2)',
                  borderRadius: '12px',
                  minHeight: '300px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                Your image will be displayed here
              </Typography>
            )}
          </Box>

          {/* Right Section: Text Fields */}
          <Box
            sx={{
              flex: { xs: '1', md: '2' },
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem',
              background: 'rgba(30, 30, 30, 0.5)',
              borderRadius: '16px',
              padding: '2rem',
              backdropFilter: 'blur(10px)',
              width: '100%',
            }}
          >
            <TextField
              label="Image Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              variant="outlined"
              fullWidth
            />
            <TextField
              label="Prompt/Description"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              variant="outlined"
              fullWidth
              multiline
              rows={4}
            />
            <TextField
              label="CID (IPFS Hash)"
              value={cid}
              variant="outlined"
              fullWidth
              disabled
            />
          </Box>
        </Box>

        {/* Footer Buttons */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            gap: '1rem',
            marginTop: '3rem',
            width: '100%',
            maxWidth: '800px',
            flexWrap: 'wrap',
          }}
        >
          <Button
            variant="contained"
            color="secondary"
            onClick={handleDownloadImage}
            sx={{
              background: 'linear-gradient(45deg, #f48fb1 30%, #f06292 90%)',
              boxShadow: '0 3px 5px 2px rgba(244, 143, 177, .3)',
              '&:hover': {
                background: 'linear-gradient(45deg, #f06292 30%, #ec407a 90%)',
              },
              minWidth: '150px',
            }}
          >
            Download
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleUploadToPinata}
            sx={{
              background: 'linear-gradient(45deg, #90caf9 30%, #64b5f6 90%)',
              boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
              '&:hover': {
                background: 'linear-gradient(45deg, #64b5f6 30%, #42a5f5 90%)',
              },
              minWidth: '150px',
            }}
          >
            Upload to Pinata
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={mintNFT}
            sx={{
              background: 'linear-gradient(45deg, #81c784 30%, #4caf50 90%)',
              boxShadow: '0 3px 5px 2px rgba(76, 175, 80, .3)',
              '&:hover': {
                background: 'linear-gradient(45deg, #4caf50 30%, #388e3c 90%)',
              },
              minWidth: '150px',
            }}
          >
            Mint NFT
          </Button>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Router>
        <Box sx={{ display: 'flex' }}>
          <AppDrawer />
          <Box component="main" sx={{ flexGrow: 1 }}>
            <Routes>
              <Route path="/" element={<MainContent />} />
              <Route path="/ipfs" element={<IPFSPage />} />
              <Route path="/mint" element={<MintNFTPage />} />
              <Route path="/ai-upload" element={<AIUploadPage />} />
            </Routes>
          </Box>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;