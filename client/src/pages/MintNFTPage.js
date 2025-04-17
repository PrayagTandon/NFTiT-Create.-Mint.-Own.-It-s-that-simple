import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  TextField,
  Button,
  Paper,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import { ImageNFT } from '../config';
import imagesmint from '../ImageNFT.json';

const validateCID = (cid) => {
  return /^Qm[1-9A-Za-z]{44}$/.test(cid);
};

const MintNFTPage = () => {
  const [fileFormat, setFileFormat] = useState('image');
  const [blockchain, setBlockchain] = useState('polygon');
  const [isMinting, setIsMinting] = useState(false);
  const [transactionHistory, setTransactionHistory] = useState([]);
  const [cid, setCid] = useState('');
  const [isInvalidCid, setIsInvalidCid] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const navigate = useNavigate();

  // Connect to MetaMask
  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts'
        });
        setWalletAddress(accounts[0]);

        // Get current chain ID
        const currentChain = await window.ethereum.request({
          method: 'eth_chainId'
        });

        // Determine target chain ID
        const targetChainId = blockchain === 'polygon'
          ? '0x13882'  // Polygon Amoy (80002 in hex)
          : '0xaa36a7'; // Ethereum Sepolia (11155111 in hex)

        // Switch if needed
        if (currentChain !== targetChainId) {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: targetChainId }],
          });
        }
      } catch (error) {
        console.error('Wallet connection error:', error);
        alert(`Wallet error: ${error.message}`);
      }
    } else {
      alert('Please install MetaMask!');
    }
  };

  const verifyMetadata = async (cid) => {
    try {
      // Try to verify metadata, but continue even if server is unavailable
      const response = await fetch(`http://localhost:5001/api/metadata/${cid}`, {
        method: 'GET',
        signal: AbortSignal.timeout(2000) // Timeout after 2 seconds
      });

      if (!response.ok) {
        console.warn('Metadata validation skipped: API returned non-OK response');
        return { valid: true }; // Proceed anyway
      }

      return await response.json();
    } catch (error) {
      console.warn('Metadata validation skipped:', error.message);
      return { valid: true }; // Proceed anyway - don't block minting if API is down
    }
  };

  // Handle CID changes
  useEffect(() => {
    if (cid) {
      setIsInvalidCid(!validateCID(cid));
    } else {
      setIsInvalidCid(false);
    }
  }, [cid]);

  // Check if wallet is already connected
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.request({ method: 'eth_accounts' })
        .then(accounts => {
          if (accounts.length > 0) {
            setWalletAddress(accounts[0]);
          }
        });
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsMinting(true);

    if (!walletAddress) {
      alert('Please connect your wallet first');
      setIsMinting(false);
      return;
    }

    if (!cid || !validateCID(cid)) {
      alert('Please enter a valid IPFS CID');
      setIsMinting(false);
      return;
    }

    try {
      // Skip metadata verification if backend is down
      await verifyMetadata(cid);

      // Setup provider and signer
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      // Create contract instance with ImageNFT contract
      const contract = new ethers.Contract(
        ImageNFT,
        imagesmint,
        signer
      );

      // Log parameters for debugging
      const signerAddress = await signer.getAddress();
      console.log('Minting parameters:', {
        contract: ImageNFT,
        from: signerAddress,
        tokenURI: `ipfs://${cid}`
      });

      // Call the safeMint function with the IPFS URI
      const tx = await contract.safeMint(
        `ipfs://${cid}`,
        {
          gasLimit: 1000000,  // Higher gas limit
          gasPrice: ethers.parseUnits('50', 'gwei') // Explicit gas price
        }
      );

      console.log('Transaction sent:', tx.hash);

      // Wait for transaction confirmation
      alert(`Transaction sent! Hash: ${tx.hash}\nWaiting for confirmation...`);
      const receipt = await tx.wait(1); // Wait for 1 confirmation
      console.log('Transaction confirmed:', receipt);

      // Record transaction in history
      setTransactionHistory(prev => [...prev, {
        hash: tx.hash,
        cid,
        timestamp: new Date().toISOString()
      }]);

      alert(`NFT minted successfully!\nTransaction hash: ${tx.hash}`);

      // Reset form after successful mint
      setCid('');

    } catch (error) {
      console.error('Minting failed:', error);

      // Provide more useful error messages based on the error
      if (error.message.includes('user rejected')) {
        alert('Transaction was rejected in your wallet.');
      } else if (error.message.includes('insufficient funds')) {
        alert('Your wallet has insufficient funds for this transaction.');
      } else if (error.message.includes('Internal JSON-RPC error')) {
        alert(`Transaction reverted by the blockchain. This could be due to:
        - Contract permissions (only owner can mint)
        - Invalid parameters
        - Blockchain network congestion

Try again with a different CID or check the contract permissions.`);
      } else {
        alert(`Error: ${error.message}`);
      }
    } finally {
      setIsMinting(false);
    }
  };

  const handleReset = () => {
    setFileFormat('image');
    setBlockchain('polygon');
    setCid('');
    setIsInvalidCid(false);
  };

  const handleIPFSRedirect = () => {
    navigate('/ipfs');
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
          maxWidth: '600px',
          margin: '0 auto',
          padding: '2rem',
          background: '#1e1e1e',
          borderRadius: '12px',
        }}
      >
        <Typography variant="h4" sx={{ mb: 4, color: '#90caf9', textAlign: 'center' }}>
          Mint NFT
        </Typography>

        {/* Wallet Connection Button */}
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          {walletAddress ? (
            <Typography variant="body1" sx={{ color: '#4caf50' }}>
              Connected: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
            </Typography>
          ) : (
            <Button
              variant="contained"
              onClick={connectWallet}
              sx={{
                background: '#90caf9',
                '&:hover': {
                  background: '#64b5f6',
                },
              }}
            >
              Connect Wallet
            </Button>
          )}
        </Box>

        <form onSubmit={handleSubmit}>
          {/* File Format Selection */}
          <FormControl component="fieldset" sx={{ mb: 4, width: '100%' }}>
            <FormLabel sx={{ color: 'white' }}>File Format</FormLabel>
            <RadioGroup
              value={fileFormat}
              onChange={(e) => setFileFormat(e.target.value)}
              sx={{ color: 'white' }}
            >
              <FormControlLabel value="image" control={<Radio />} label="Image" />
              <FormControlLabel value="audio" control={<Radio />} label="Audio" />
              <FormControlLabel value="video" control={<Radio />} label="Video" />
            </RadioGroup>
          </FormControl>

          {/* Blockchain Selection */}
          <FormControl component="fieldset" sx={{ mb: 4, width: '100%' }}>
            <FormLabel sx={{ color: 'white' }}>Blockchain Network</FormLabel>
            <RadioGroup
              value={blockchain}
              onChange={(e) => setBlockchain(e.target.value)}
              sx={{ color: 'white' }}
            >
              <FormControlLabel value="polygon" control={<Radio />} label="Polygon Amoy" />
              <FormControlLabel value="ethereum" control={<Radio />} label="Ethereum Sepolia" />
            </RadioGroup>
          </FormControl>

          {/* CID Input with IPFS Redirect Button */}
          <Box sx={{ position: 'relative', mb: 4 }}>
            <TextField
              fullWidth
              label="IPFS CID"
              value={cid}
              onChange={(e) => setCid(e.target.value)}
              error={isInvalidCid}
              helperText={isInvalidCid ? "Invalid CID format" : ""}
              sx={{
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
            <Button
              onClick={handleIPFSRedirect}
              sx={{
                position: 'absolute',
                right: '-8px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#90caf9',
                fontSize: '0.75rem',
                whiteSpace: 'nowrap',
                '&:hover': {
                  background: 'rgba(144, 202, 249, 0.1)',
                },
              }}
            >
              Don't have file on IPFS? Click here
            </Button>
          </Box>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              type="submit"
              variant="contained"
              disabled={!walletAddress || isMinting || isInvalidCid}
              sx={{
                background: '#90caf9',
                '&:hover': {
                  background: '#64b5f6',
                },
                minWidth: '120px',
              }}
            >
              {isMinting ? 'Minting...' : 'Mint NFT'}
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
        </form>
      </Paper>
    </Box>
  );
};

export default MintNFTPage; 