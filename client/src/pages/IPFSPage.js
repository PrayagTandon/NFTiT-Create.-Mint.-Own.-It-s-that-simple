import React, { useState, useRef } from 'react';
import {
  Box,
  Typography,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Button,
  Paper,
  IconButton,
  Stack,
  TextField,
  InputAdornment,
  Snackbar,
  Alert
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

const IPFSPage = () => {
  const [fileType, setFileType] = useState('image');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [CID, setCID] = useState('');
  const [IPFSURL, setIPFSURL] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const fileInputRef = useRef(null);
  const audioRef = useRef(null);
  const videoRef = useRef(null);

  const handleFileTypeChange = (event) => {
    setFileType(event.target.value);
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = {
      image: ['image/jpeg', 'image/png', 'image/psd'],
      audio: ['audio/mpeg', 'audio/mp3'],
      video: ['video/mp4']
    };

    if (!validTypes[fileType].includes(file.type)) {
      alert(`Please select a valid ${fileType} file`);
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setIsPlaying(false);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert('Please select a file first');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      console.log('Uploading file:', {
        name: selectedFile.name,
        type: selectedFile.type,
        size: selectedFile.size
      });

      const response = await fetch('http://localhost:5000/api/ipfs/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      if (data.success) {
        setCID(data.cid);
        setIPFSURL(data.url);
        setShowSuccess(true);
      } else {
        alert(`Upload failed: ${data.error}`);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert(`Error uploading file: ${error.message}`);
    }
  };

  const handleCopyCID = () => {
    navigator.clipboard.writeText(CID);
  };

  const handleCopyURL = () => {
    navigator.clipboard.writeText(IPFSURL);
  };

  const handlePlayPause = () => {
    if (fileType === 'audio' && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
    } else if (fileType === 'video' && videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
    setIsPlaying(!isPlaying);
  };

  const handleDelete = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setIsPlaying(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #121212 0%, #1e1e1e 100%)',
        padding: '2rem',
        color: 'white',
      }}
    >
      <Typography variant="h4" component="h1" sx={{ mb: 4, textAlign: 'center' }}>
        IPFS File Upload
      </Typography>

      <Paper
        elevation={3}
        sx={{
          p: 3,
          maxWidth: 800,
          mx: 'auto',
          backgroundColor: 'rgba(30, 30, 30, 0.5)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <FormControl component="fieldset" sx={{ mb: 3 }}>
          <FormLabel component="legend">Select File Type</FormLabel>
          <RadioGroup
            row
            value={fileType}
            onChange={handleFileTypeChange}
            sx={{ justifyContent: 'center' }}
          >
            <FormControlLabel
              value="image"
              control={<Radio />}
              label="Image (JPG/PNG/PSD)"
            />
            <FormControlLabel
              value="audio"
              control={<Radio />}
              label="Audio (MP3)"
            />
            <FormControlLabel
              value="video"
              control={<Radio />}
              label="Video (MP4)"
            />
          </RadioGroup>
        </FormControl>

        <Stack spacing={3} alignItems="center">
          <Button
            variant="contained"
            component="label"
            startIcon={<CloudUploadIcon />}
            sx={{
              background: 'linear-gradient(45deg, #90caf9 30%, #64b5f6 90%)',
              boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
              '&:hover': {
                background: 'linear-gradient(45deg, #64b5f6 30%, #42a5f5 90%)',
              },
            }}
          >
            Select File
            <input
              type="file"
              hidden
              ref={fileInputRef}
              accept={fileType === 'image' ? '.jpg,.jpeg,.png,.psd' :
                fileType === 'audio' ? '.mp3' : '.mp4'}
              onChange={handleFileSelect}
            />
          </Button>

          {selectedFile && (
            <Typography variant="body1">
              Selected file: {selectedFile.name}
            </Typography>
          )}

          {previewUrl && (
            <Box sx={{ width: '100%', textAlign: 'center' }}>
              {fileType === 'image' && (
                <img
                  src={previewUrl}
                  alt="Preview"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '400px',
                    borderRadius: '8px',
                  }}
                />
              )}
              {fileType === 'audio' && (
                <Box sx={{ width: '100%' }}>
                  <audio
                    ref={audioRef}
                    src={previewUrl}
                    controls
                    style={{ width: '100%' }}
                  />
                </Box>
              )}
              {fileType === 'video' && (
                <video
                  ref={videoRef}
                  src={previewUrl}
                  controls
                  style={{
                    maxWidth: '100%',
                    maxHeight: '400px',
                    borderRadius: '8px',
                  }}
                />
              )}
            </Box>
          )}

          <Stack direction="row" spacing={2}>
            <Button
              variant="contained"
              onClick={handleUpload}
              disabled={!selectedFile}
              sx={{
                background: 'linear-gradient(45deg, #4caf50 30%, #388e3c 90%)',
                boxShadow: '0 3px 5px 2px rgba(76, 175, 80, .3)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #388e3c 30%, #2e7d32 90%)',
                },
              }}
            >
              Upload to IPFS
            </Button>
            {selectedFile && (
              <IconButton
                onClick={handleDelete}
                sx={{
                  color: '#f44336',
                  '&:hover': {
                    backgroundColor: 'rgba(244, 67, 54, 0.1)',
                  },
                }}
              >
                <DeleteIcon />
              </IconButton>
            )}
          </Stack>

          {CID && (
            <Paper
              elevation={2}
              sx={{
                p: 2,
                width: '100%',
                backgroundColor: 'rgba(0, 0, 0, 0.2)',
                borderRadius: '8px',
              }}
            >
              <Typography variant="h6" sx={{ mb: 2, color: '#4caf50' }}>
                IPFS Upload Successful!
              </Typography>

              <Stack spacing={2}>
                <TextField
                  label="CID"
                  value={CID}
                  fullWidth
                  disabled
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={handleCopyCID} sx={{ color: '#90caf9' }}>
                          <ContentCopyIcon />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  label="IPFS URL"
                  value={IPFSURL}
                  fullWidth
                  disabled
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={handleCopyURL} sx={{ color: '#90caf9' }}>
                          <ContentCopyIcon />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Stack>
            </Paper>
          )}
        </Stack>
      </Paper>

      <Snackbar
        open={showSuccess}
        autoHideDuration={3000}
        onClose={() => setShowSuccess(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="success" sx={{ width: '100%' }}>
          File uploaded successfully to IPFS!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default IPFSPage; 