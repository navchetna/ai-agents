import React from 'react';
import { AppBar, Toolbar, Typography, Avatar, Box, IconButton, Menu, MenuItem } from '@mui/material';
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
    <AppBar position="static" sx={{ backgroundColor: '#FFFD01' }}>
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Typography variant="h6" component="div" sx={{ color: 'black', fontFamily: 'Aptos, sans-serif' }}>
          Chat Agent
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar 
            src={user.avatarUrl} 
            alt={user.name}
            sx={{ width: 32, height: 32, marginRight: 1 }}
          >
            {!user.avatarUrl && <AccountCircleIcon />}
          </Avatar>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', marginRight: 1 }}>
            <Typography variant="subtitle2" sx={{ color: 'black', fontFamily: 'Aptos, sans-serif' }}>
              {user.name}
            </Typography>
            <Typography variant="caption" sx={{ color: 'black', fontFamily: 'Aptos, sans-serif' }}>
              {user.email}
            </Typography>
          </Box>
          <IconButton
            size="large"
            aria-label="account of current user"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={handleMenu}
            color="inherit"
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
          >
            <MenuItem onClick={handleClose} sx={{ fontFamily: 'Aptos, sans-serif' }}>Profile</MenuItem>
            <MenuItem onClick={handleClose} sx={{ fontFamily: 'Aptos, sans-serif' }}>Settings</MenuItem>
            <MenuItem onClick={handleClose} sx={{ fontFamily: 'Aptos, sans-serif' }}>Logout</MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;

