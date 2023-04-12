import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import { redirect, useNavigate } from "react-router-dom";
import LogoutIcon from '@mui/icons-material/Logout';

export default function ButtonAppBar(props) {
    const navigation = useNavigate();
    const handleLogout = () =>{
        localStorage.clear();
        navigation(`/`)
    }
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
          >
            <MenuIcon sx={{color:"white !important"}}/>
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 , color:"white !important"}}>
            Narayana Pearls
          </Typography>
          <span onClick={handleLogout} style={{cursor:"pointer"}}><LogoutIcon /></span>
        </Toolbar>
      </AppBar>
      {props.children}
    </Box>
    
  );
}


//#011E3C