import React from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Avatar, 
  Box, 
  IconButton, 
  Menu, 
  MenuItem 
} from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

interface NavbarProps {
  user: {
    name: string;
    email: string;
    avatarUrl?: string;
  };
}

const Navbar: React.FC<NavbarProps> = ({ user }) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        backgroundColor: '#0071C5',
        zIndex: 1300,
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Typography 
          variant="h6" 
          component="div" 
          sx={{ 
            color: 'white', 
            fontFamily: 'Aptos, sans-serif',
            fontWeight: 800
          }}
        >
          Research Assistant
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar 
            src={user.avatarUrl}
            alt={user.name}
            sx={{ 
              width: 32, 
              height: 32, 
              marginRight: 1,
              border: '2px solid rgba(0, 0, 0, 0.1)'
            }}
          >
            {!user.avatarUrl && <AccountCircleIcon />}
          </Avatar>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'flex-end', 
            marginRight: 1 
          }}>
            <Typography 
              variant="subtitle2" 
              sx={{ 
                color: 'white', 
                fontFamily: 'Aptos, sans-serif',
                fontWeight: 500
              }}
            >
              {user.name}
            </Typography>
            <Typography 
              variant="caption" 
              sx={{ 
                color: 'white', 
                fontFamily: 'Aptos, sans-serif'
              }}
            >
              {user.email}
            </Typography>
          </Box>
          <IconButton
            size="large"
            aria-label="account of current user"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={handleMenu}
            sx={{ color: 'black' }}
          >
            <ArrowDropDownIcon />
          </IconButton>
          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorEl)}
            onClose={handleClose}
            sx={{
              '& .MuiPaper-root': {
                marginTop: '4px',
                borderRadius: '8px',
                boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
              }
            }}
          >
            <MenuItem 
              onClick={handleClose} 
              sx={{ 
                fontFamily: 'Aptos, sans-serif',
                py: 1.5,
                px: 2,
                '&:hover': {
                  backgroundColor: 'rgba(255, 253, 1, 0.1)'
                }
              }}
            >
              Profile
            </MenuItem>
            <MenuItem 
              onClick={handleClose} 
              sx={{ 
                fontFamily: 'Aptos, sans-serif',
                py: 1.5,
                px: 2,
                '&:hover': {
                  backgroundColor: 'rgba(255, 253, 1, 0.1)'
                }
              }}
            >
              Settings
            </MenuItem>
            <MenuItem 
              onClick={handleClose} 
              sx={{ 
                fontFamily: 'Aptos, sans-serif',
                py: 1.5,
                px: 2,
                color: '#d32f2f',
                '&:hover': {
                  backgroundColor: 'rgba(211, 47, 47, 0.1)'
                }
              }}
            >
              Logout
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
