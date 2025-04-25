import { useState, useEffect } from "react";
import Zooba from ".././assets/Zooba.png";
import boba from ".././assets/chafortea.png";
import omomo from ".././assets/omomo.png";
import bako from ".././assets/bako.png";
import "../styles/Home.css"
import TextField from "@mui/material/TextField";
import { Button, Box, Card, CardMedia, CardContent, Typography } from '@mui/material';
import { useNavigate } from "react-router-dom";
import api from "../api";
import { ACCESS_TOKEN } from "../constants";
import { Navbar, Nav, Container } from "react-bootstrap";
// import { Card } from "react-bootstrap";
import TopBar from "../components/TopBar";
import Select from 'react-select';
import Rating from '@mui/material/Rating';
import Chip from '@mui/material/Chip';
import Autocomplete from '@mui/material/Autocomplete';
import Stack from '@mui/material/Stack';



// import RestaurantList from "./RestaurantList";
// import Login from "./pages/Login";
// import { BrowserRouter, Route, Routes, Switch } from "react-router-dom";

function Home() {
  const [searchTerm, setSearchTerm] = useState("");
  const [restaurants, setRestaurants] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [categories, setCategories] = useState([]);
  const [rating, setRating] = useState(0);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [categoryRatings, setCategoryRatings] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shouldNavigate, setShouldNavigate] = useState(false);
  const [cards, setCards] = useState([]);

  
  const navigate = useNavigate();

  useEffect(() => {
    api.get("api/homeCards/")
      .then((res) => res.data)
      .then((data) => {
        setCards(data);
      })
      .catch((error) => alert(error));
  }, []);

  useEffect(() => {
    api.get("api/category/")
      .then((res) => res.data)
      .then((data) => {
        setCategories(data);
      })
      .catch((error) => alert(error));
  }, []);

  

  useEffect(() => {
    getRestaurants();
    checkLoginStatus();
  }, [])

  const getRestaurants = () => {
    api
      .get("/api/restaurants/")
      .then((res) => res.data)
      .then((data) => { setRestaurants(data)})
      .catch((error) => alert(error));
  };
  
  const checkLoginStatus = () => {
    const token = localStorage.getItem(ACCESS_TOKEN);
    setIsLoggedIn(!!token);
  };

  const handleLogout = () => {
    localStorage.removeItem(ACCESS_TOKEN);
    setIsLoggedIn(false);
    navigate("/login");
  };

  const handleCategoryChange = (event) => {
    const value = event.target.value;
    setSelectedCategories(prev =>
      prev.includes(value) ? prev.filter(cat => cat !== value) : [...prev, value]
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

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
    .then((data) => { setRestaurants(data); })
    .catch((error) => alert(error));
    setLoading(false)
    setShouldNavigate(true);
  };

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
  

  const categoryOptions = categories.map((category) => ({
    value: category.id,
    label: category.category_name.charAt(0).toUpperCase() + category.category_name.slice(1)
  }));


function TopBar() {
    const returnHome = () => {
      window.location.href = "/";
    }
    
  return (
    <Navbar style={{ backgroundColor: "#ccae88" }} expand="lg" className="px-3">
        <Navbar.Brand href="#">
          <img src={Zooba} alt="Zooba logo" width="50" height="50" onClick={returnHome}/>
          Zoba
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
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
  );
}
  
function RatingCard({ entry_name, rating }) {
  return (
    <Card className="text-center shadow-sm border-0 rounded-pill bg-light px-3 py-2 mb-2">
      <Card.Body className="p-1">
        <strong>{entry_name}</strong> {rating} ⭐
      </Card.Body>
    </Card>
  );
}

  // The card that contains the pics and cafe info
  function EntryCard({ restaurant, pic_source, rating1, rating2, rating3, rest_id, address, restaurant_category_ratings, image }) {
  const navigate = useNavigate();
  
  const handleClick = () => {
    navigate("/restaurant", {
      state: {
        name_from_home: restaurant,
        pic_from_home: pic_source,
        ratings_from_home: [rating1, rating2, rating3],
        rest_id: rest_id,
      },
    });
  };

  function CategoryRatingCard({ category, rating }) {
    return (
      <Card className="shadow-sm border-0 bg-light px-2 py-1 mx-1 my-1" style={{ minWidth: "auto", fontSize: "0.9rem" }}>
        <Card.Body className="p-1 text-center">
          <strong>{category}:</strong> {rating} ⭐
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className="m-3 shadow-sm" style={{ cursor: "pointer" }} onClick={handleClick}>
      <Card.Img variant="top" src={pic_source} className="card-img-custom"  />
      <Card.Body>
        <Card.Title>{restaurant}</Card.Title>
        <Card.Text>
        {address}
        </Card.Text>
        <div className="d-flex flex-wrap justify-content-center mt-2">
          {restaurant_category_ratings.map((category_rating, index) => (
            <CategoryRatingCard
              key={index}
              category={category_rating.category_name}
              rating={category_rating.rating}
            />
          ))}
        </div>
      </Card.Body>
    </Card>
  );
}
const AlternatingCards = () => {

  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % cards.length);
    }, 5000); // every 5 seconds
  return () => clearInterval(interval); // cleanup
  }, [cards.length]);

  const handleClick = () => {
    navigate('/search', {
      state: {searchTerm: "",  selectedCategories: cards[activeIndex].categories, rating: cards[activeIndex].rating }
   });
  }; 

  if (cards.length != 0) {
    return (
      <Box
      sx={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        boxSizing: 'border-box',
        backgroundColor: '#f0f0f0',
      }}
    >
      <Card
        sx={{
          width: '100%',
          height: '100%',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <CardMedia
          component="img"
          image={cards[activeIndex].image}
          alt="Card Image"
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            position: 'absolute',
            top: 0,
            left: 0,
          }}
        />
        <CardContent
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'rgba(0,0,0,0.4)',
            color: '#fff',
            padding: 2,
            borderRadius: 2,
            textAlign: 'center',
            cursor: 'pointer',
          }}        >
          <Typography variant="h4"           onClick={handleClick}          >
            
            {cards[activeIndex].message + ' 🔍'}
          </Typography>
          <Container className="mt-4">
            <TextField
                className="border-0 shadow-none w-100" 
                id="search-input"
                variant="standard" 
                placeholder="Search for a drink or cafe"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                    disableUnderline: true,     
                }}
            />
    <div>
      <Button variant="outline-primary" className="me-2"  onClick={() => setShowFilters(prev => !prev)} style={{ marginBottom: '10px' }}>
        {showFilters ? 'Hide Filters ✖️' : "Filter"}
      </Button>

      {showFilters && (
      <form onSubmit={handleSubmit}>
          <legend>Select Categories:</legend>
            {/* <Select
              options={categoryOptions}
              isMulti
              onChange={(selectedOptions) => {
                const selectedIds = selectedOptions.map((opt) => opt.value);
                setSelectedCategories(selectedIds);
              }}
              placeholder="Search and select categories..."
              openMenuOnFocus={false}
              openMenuOnClick={false} 
              filterOption={(option, inputValue) => {
                if (!inputValue) return false;
                return option.label.toLowerCase().includes(inputValue.toLowerCase());
              }}
              styles={{
                placeholder: (base) => ({
                  ...base,
                  color: '#888888', // 👈 Change this to your desired color
                  fontStyle: 'italic', // optional
                }),
              }}
            /> */}
            <Autocomplete 
            sx={{ width: '100%' }}
              multiple
              id="tags-outlined"
              options={categoryOptions}
              value={selectedCategories}  // This must match shape of options
              isOptionEqualToValue={(option, value) => option.value === value.value}
              getOptionLabel={(option) => option.label}
              filterSelectedOptions
              onChange={(event, value) => {
                setSelectedCategories(value);  // Save full objects instead of just IDs
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="standard"
                  placeholder="Search and select categories..."
                  label="Multiple values"
                  sx={{
                    backgroundColor: 'white',
                    borderRadius: 1,
                    input: { color: 'black' },
                  }}
                />
              )}
              
            />
        <div style={{ marginTop: '10px' }}>
          <label>
            Minimum Rating:
            <Rating
              name="simple-controlled"
              value={rating}
              precision={0.5}
              onChange={(e) =>
                setRating(e.target.value)
              }
            />
          </label>
        </div>

        <Button variant="outline-primary" type="submit" style={{ marginTop: '15px' }}>
          Filter
        </Button>
      </form>
      )}
      
          </div>
          

      </Container>
        </CardContent>
      </Card>
    </Box>
    );
  }
  }

  return (
    <>
      <TopBar />
      
      <AlternatingCards />

    </>
  );
}

export default Home;
