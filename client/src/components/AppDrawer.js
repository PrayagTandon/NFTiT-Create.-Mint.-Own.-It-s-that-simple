import React, { useState } from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Box,
  Typography,
  useTheme
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import StorageIcon from '@mui/icons-material/Storage';
import TokenIcon from '@mui/icons-material/Token';
import UploadIcon from '@mui/icons-material/Upload';
import { useNavigate, useLocation } from 'react-router-dom';

const DRAWER_WIDTH = 240;

const AppDrawer = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();

  const menuItems = [
    {
      text: 'AI + NFT',
      icon: <AutoAwesomeIcon />,
      path: '/'
    },
    // {
    //   text: 'AI Image Editor',
    //   icon: <ImageIcon />,
    //   path: '/ai-upload'
    // },
    {
      text: 'IPFS',
      icon: <StorageIcon />,
      path: '/ipfs'
    },
    {
      text: 'Mint NFT',
      icon: <TokenIcon />,
      path: '/mint'
    },
    {
      text: 'AI Upload',
      icon: <UploadIcon />,
      path: '/ai-upload'
    }
  ];

  return (
    <>
      <IconButton
        onClick={() => setDrawerOpen(true)}
        sx={{
          position: 'fixed',
          top: '24px',
          left: '24px',
          zIndex: 1200,
          color: 'white',
          backgroundColor: 'rgba(0, 0, 0, 0.2)',
          backdropFilter: 'blur(10px)',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
          },
        }}
      >
        <MenuIcon />
      </IconButton>

      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{
          sx: {
            width: DRAWER_WIDTH,
            backgroundColor: theme.palette.background.paper,
            backgroundImage: 'none',
            borderRight: `1px solid ${theme.palette.divider}`,
          }
        }}
      >
        <Box
          sx={{
            p: 2,
            background: 'linear-gradient(45deg, #90caf9 30%, #64b5f6 90%)',
            color: 'white',
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            NFTiT - Create.Own.Mint
          </Typography>
        </Box>
        <List>
          {menuItems.map((item) => (
            <ListItem
              button
              key={item.text}
              onClick={() => {
                navigate(item.path);
                setDrawerOpen(false);
              }}
              selected={location.pathname === item.path}
              sx={{
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
                '&.Mui-selected': {
                  backgroundColor: 'rgba(144, 202, 249, 0.1)',
                  '&:hover': {
                    backgroundColor: 'rgba(144, 202, 249, 0.2)',
                  },
                },
              }}
            >
              <ListItemIcon sx={{ color: 'white' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
        </List>
      </Drawer>
    </>
  );
};

export default AppDrawer; 