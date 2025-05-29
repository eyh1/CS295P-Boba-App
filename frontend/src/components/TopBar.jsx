import "../styles/TopBar.css"
import Zooba from "../assets/Zooba.png";
import { Button, TextField, IconButton} from "@mui/material";
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

function TopBar({setSearchTerm = () => {}, setRestaurants = () => {}}) {
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
    <div style={{ paddingTop: "100px" }}>
      <div className="p-0">
      
    <Navbar
      // color of navbar
      style={{
        backgroundColor: "#8CC6B3",
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        width: "100%",
        zIndex: 1000
      }}>
        <Navbar.Brand style={{ marginLeft: "10px" }} href="/">
                  <img src={Zooba} alt="Zooba logo" width="50" height="50" onClick={returnHome} />

                  Zoba
                </Navbar.Brand>
                
                          
      {/* <IconButton 
            variant="outlined"
            className="m-0 p-0"
            onClick={() => setShowFilters(prev => !prev)}
            sx={{ 
                color: 'black',
                display: 'flex',
                flexDirection: 'column',  
                alignItems: 'center',
                justifyContent: 'center',
                gap: 0.5,
            }}
            size="large"
            >
            {showFilters ? <CloseIcon fontSize="large" /> : <TuneIcon fontSize="large" />}
            <span style={{ fontSize: '0.8rem' }}>Filter</span>
            </IconButton> */}
        <Navbar.Toggle aria-controls="basic-navbar-nav" className="ms-1 p-1" />
        <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
          { isLoggedIn ? (<div>
            <Button variant="outline-primary" className="me-2" href="/profile">
              Profile
            </Button>
            <Button variant="outline-primary" className="me-2" onClick={handleLogout}>
                Logout
              </Button>
          </div>
        ) : (
            <>
              <Button variant="outline-primary" className="me-2" href="/login">
                Login
              </Button>
              <Button variant="primary" href="/register">
                Sign Up
              </Button>
            </>
          )}
        </Navbar.Collapse>
    </Navbar>
    {/* {showFilters && (
      <div>
      <form onSubmit={handleSubmit}>
        <fieldset>
            <Select
              options={categoryOptions}
              isMulti
              value={selectedCategories}
              onChange={(selectedOptions) => {
                setSelectedCategories(selectedOptions);
              }}
              placeholder="Search and select categories..."
              openMenuOnFocus={true}
              openMenuOnClick={true} 
              filterOption={(option, inputValue) => {
                if (!inputValue) return true; // Show all if no input
                return option.label.toLowerCase().includes(inputValue.toLowerCase());
              }}
              styles={{
                placeholder: (base) => ({
                  ...base,
                  color: 'black',
                  fontStyle: 'italic',
                }),
                singleValue: (base) => ({
                  ...base,
                  color: 'black',
                }),
                input: (base) => ({
                  ...base,
                  color: 'black',
                }),
                option: (base, state) => ({
                  ...base,
                  color: 'black',
                  backgroundColor: state.isFocused ? '#e0e0e0' : 'white',
                }),
                multiValueRemove: (base) => ({
                  ...base,
                  color: 'black',
                  ':hover': {
                    backgroundColor: '#e0e0e0',
                    color: 'black',
                  },
                }),
              }}
            />
            </fieldset>
        <div style={{ marginTop: '10px' }}>
          <label style={{ color: 'black' }}>
            Minimum Rating:
            <Rating
              name="simple-controlled"
              value={rating}
              precision={0.5}
              onChange={(event, newValue) => setRating(newValue)}
              sx={{ position: 'relative', top: '6px' }}
            />
          </label>
        </div>
      <Button variant="outline-primary" type="submit" style={{ marginTop: '15px' }}sx={{ color: 'black' }}>
                Filter
              </Button>
      </form> 
      </div>
    )} */}
      </div>
    </div>
  );
}

export default TopBar;