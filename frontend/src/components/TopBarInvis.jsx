import "../styles/TopBar.css"
import Zooba from "../assets/Zooba.png";
import { Button, Grid2, TextField, IconButton, Box, Typography} from "@mui/material";
import { Navbar, Nav, Container, Form, Collapse } from "react-bootstrap";
import { useState, useEffect } from "react";
import { ACCESS_TOKEN } from "../constants";
import api from "../api";
import { useNavigate } from "react-router-dom";
import '@fontsource/poppins';

function TopBarInvis({setSearchTerm = () => {}, setRestaurants = () => {}}) {
    const returnHome = () => {
      window.location.href = "/";
    }
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [searchTerm, setSelfSearchTerm] = useState("");
    const [restaurants, setSelfRestaurants] = useState([]);
    const [showFilters, setShowFilters] = useState(false);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [categories, setCategories] = useState([]);
    const [rating, setRating] = useState(0);
    const [isBoxOpen, setIsBoxOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [shouldNavigate, setShouldNavigate] = useState(false);
    const navigate = useNavigate();
    

    useEffect(() => {
      api.get("api/category/")
        .then((res) => res.data)
        .then((data) => {
          setCategories(data);
        })
        .catch((error) => alert(error));
    }, []);

    const checkLoginStatus = () => {
      const token = localStorage.getItem(ACCESS_TOKEN);
      setIsLoggedIn(!!token);
    };

    const handleLogout = () => {
      localStorage.removeItem(ACCESS_TOKEN);
      setIsLoggedIn(false);
      navigate("/login");
    };

    useEffect(() => {
      checkLoginStatus();
    }, [])

    
    useEffect(() => {
      if (!loading && shouldNavigate) {
        navigate('/search', {
          state: {
            searchTerm,
            selectedCategories: selectedCategories.map(cat => cat.value),
            rating,
          },
        });
      }
    }, [loading, shouldNavigate, navigate]);
    
  return (
    <div>
      <div className="p-0">
      
    <Navbar
      style={{
        backgroundColor: "transparent",
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        width: "100%",
        zIndex: 1000
      }}>
        <Navbar.Brand style={{ marginLeft: "10px" }} href="#">
                  <img src={Zooba} alt="Zooba logo" width="50" height="50" onClick={returnHome} />

                  
                </Navbar.Brand>
        <Typography sx={{ color:'white', fontSize: 36, fontFamily: 'Poppins', textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)'}}>
            Zoba
        </Typography>
                
      
        <Navbar.Toggle aria-controls="basic-navbar-nav" className="ms-1 p-1" />
        <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
          {isLoggedIn ? (
    <>
      <Button
        variant="contained"
        href="/profile"
        sx={{
          bgcolor: "#8CC6B3",
          borderRadius: 999,
          minWidth: 80,
          maxWidth: 150,
          flexShrink: 1,
          whiteSpace: 'nowrap',
          ml: 1,
        }}
      >
        Profile
      </Button>
      <Button
        variant="contained"
        onClick={handleLogout}
        sx={{
          bgcolor: "white",
          color: '#8CC6B3',
          borderRadius: 999,
          minWidth: 80,
          maxWidth: 150,
          flexShrink: 1,
          whiteSpace: 'nowrap',
          ml: 1,
          mr: 1,
        }}
      >
        Logout
      </Button>
    </>
  ) : (
    <>
      <Button
        variant="contained"
        href="/login"
        sx={{
          bgcolor: "#8CC6B3",
          borderRadius: 999,
          minWidth: 80,
          maxWidth: 150,
          flexShrink: 1,
          whiteSpace: 'nowrap',
          ml: 1,
        }}
      >
        Login
      </Button>
      <Button
        variant="contained"
        href="/register"
        sx={{
          bgcolor: "white",
          color: '#8CC6B3',
          borderRadius: 999,
          minWidth: 80,
          maxWidth: 150,
          flexShrink: 1,
          whiteSpace: 'nowrap',
          ml: 1,
          mr: 1,
        }}
      >
        Sign Up
      </Button>
    </>
  )}
        </Navbar.Collapse>
    </Navbar>
    
      </div>
    </div>
  );
}

export default TopBarInvis;