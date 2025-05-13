import "../styles/TopBar.css"
import Zooba from "../assets/Zooba.png";
import { Button, TextField, IconButton, Box, Typography} from "@mui/material";
import { Navbar, Nav, Container, Form, Collapse } from "react-bootstrap";
import { useState, useEffect } from "react";
import { ACCESS_TOKEN } from "../constants";
import Select from 'react-select';
import api from "../api";
import Rating from '@mui/material/Rating';
import { useNavigate } from "react-router-dom";
import TuneIcon from '@mui/icons-material/Tune';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
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

    const handleSubmit = async (event) => {
      if (event) event.preventDefault();
      setLoading(true);
      setSearchTerm(searchTerm);
      setSelfSearchTerm(searchTerm);
      const queryParams = new URLSearchParams();
      if (categories.length > 0) {
        queryParams.append('categories', selectedCategories.map(cat => cat.value).join(','));
      }
      if (rating) {
        queryParams.append('rating', rating);
      }
      api
      .get(`/api/restaurants/?${queryParams.toString()}`)
      .then((res) => res.data)
      .then((data) => { setRestaurants(data);
        setSelfRestaurants(data)
       })
      .catch((error) => alert(error));
      setLoading(false)
      setShouldNavigate(true);
    };

    const handleCategoryChange = (event) => {
      const value = event.target.value;
      setSelectedCategories(prev =>
        prev.includes(value) ? prev.filter(cat => cat !== value) : [...prev, value]
      );
    };

    const categoryOptions = categories.map((category) => ({
      value: category.id,
      label: category.category_name.charAt(0).toUpperCase() + category.category_name.slice(1)
    }));
    
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
      // color of navbar
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
          { isLoggedIn ? (<Box sx={{ m: 2 }}>
            <Button variant="contained" className="me-2" href="/profile" sx={{bgcolor: "#8CC6B3", borderRadius: 999}}>
              Profile
            </Button>
            <Button variant="contained" className="me-2" onClick={handleLogout} sx={{bgcolor: "white", color:'#8CC6B3', borderRadius: 999}}>
                Logout
              </Button>
          </Box>
        ) : (
            <Box sx={{ m: 2 }}>
              <Button variant="contained"  className="me-2" href="/login" sx={{bgcolor: "#8CC6B3", borderRadius: 999}}>
                Login
              </Button>
              <Button variant="contained" href="/register" sx={{bgcolor: "white", color:'#8CC6B3', borderRadius: 999}}>
                Sign Up
              </Button>
            </Box>
          )}
        </Navbar.Collapse>
    </Navbar>
    
      </div>
    </div>
  );
}

export default TopBarInvis;