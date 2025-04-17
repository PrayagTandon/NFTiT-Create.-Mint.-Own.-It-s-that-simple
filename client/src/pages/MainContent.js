import React, { useState } from 'react';
import { Box, Typography, TextField, Button } from '@mui/material';

const MainContent = () => {
<<<<<<< HEAD
    const [prompt, setPrompt] = useState('');
    const [generatedImage, setGeneratedImage] = useState(null);

    // Simple placeholder function
    const handleGenerateClick = () => {
        if (prompt.trim()) {
            // In a real app, this would call an API
            alert(`You entered: ${prompt}`);
        } else {
            alert('Please enter a prompt!');
        }
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #121212 0%, #1e1e1e 100%)',
                padding: '2rem',
                color: 'white',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
            }}
        >
            <Typography
                variant="h4"
                component="h1"
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
                }}
            >
                <TextField
                    variant="outlined"
                    placeholder="Write a Prompt to generate an image"
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

            {/* Placeholder for image display */}
            <Box
                sx={{
                    width: '100%',
                    maxWidth: '500px',
                    height: '300px',
                    background: 'rgba(0, 0, 0, 0.2)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
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
                        }}
                    />
                ) : (
                    <Typography
                        variant="body1"
                        color="textSecondary"
                        textAlign="center"
                    >
                        Your image will be displayed here
                    </Typography>
                )}
            </Box>
        </Box>
    );
=======
  const [prompt, setPrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState(null);

  // Simple placeholder function
  const handleGenerateClick = () => {
    if (prompt.trim()) {
      // In a real app, this would call an API
      alert(`You entered: ${prompt}`);
    } else {
      alert('Please enter a prompt!');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #121212 0%, #1e1e1e 100%)',
        padding: '2rem',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <Typography
        variant="h4"
        component="h1"
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
        }}
      >
        <TextField
          variant="outlined"
          placeholder="Write a Prompt to generate an image"
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

      {/* Placeholder for image display */}
      <Box
        sx={{
          width: '100%',
          maxWidth: '500px',
          height: '300px',
          background: 'rgba(0, 0, 0, 0.2)',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
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
            }}
          />
        ) : (
          <Typography
            variant="body1"
            color="textSecondary"
            textAlign="center"
          >
            Your image will be displayed here
          </Typography>
        )}
      </Box>
    </Box>
  );
>>>>>>> bf8da402676012fac8c3f510524312b1d1226d57
};

export default MainContent; 