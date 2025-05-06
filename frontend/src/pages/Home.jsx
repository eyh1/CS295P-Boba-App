import { useState, useEffect } from "react";
import "../styles/Home.css"
import Zooba from "../assets/Zooba.png";
import TextField from "@mui/material/TextField";
import { Button, Box, Card, CardMedia, CardContent, Typography, IconButton} from '@mui/material';
import { useNavigate } from "react-router-dom";
import api from "../api";
import { ACCESS_TOKEN } from "../constants";
import { Navbar, Nav, Container } from "react-bootstrap";
import TopBar from "../components/TopBar";
import TuneIcon from '@mui/icons-material/Tune';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import Select from 'react-select';
import Rating from '@mui/material/Rating';
import LaunchIcon from '@mui/icons-material/Launch';

function Home() {
  const returnHome = () => {
    window.location.href = "/";
  }
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [restaurants, setRestaurants] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [rating, setRating] = useState(0);
  const [isBoxOpen, setIsBoxOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shouldNavigate, setShouldNavigate] = useState(false);
  const [cards, setCards] = useState([]);
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

  const restaurantOptions = restaurants.map((restaurant) => ({
    value: restaurant.id,
    label: restaurant.restaurant_name.charAt(0).toUpperCase() + restaurant.restaurant_name.slice(1)
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
  
  useEffect(() => {
    api.get("api/homeCards/")
      .then((res) => res.data)
      .then((data) => {
        setCards(data);
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

function TopBar() {
  return (
    <div  className="p-0">
      
    <Navbar
     style={{ backgroundColor: "#ccae88" }} expand="lg" className="p-0">
        <Navbar.Brand style={{ marginLeft: "10px" }} href="#">
                  <img src={Zooba} alt="Zooba logo" width="50" height="50" onClick={returnHome} />
                  Zoba
                </Navbar.Brand>   
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
    </div>
  )
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

  return (
    <>
      <TopBar setSearchTerm={setSearchTerm} setRestaurants={setRestaurants} loading={setLoading}/>
      
      {cards.length > 0 &&
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
            backgroundColor: 'rgba(255, 255, 255, .85)',
            color: 'black',
            padding: 2,
            borderRadius: 4,
            textAlign: 'center',
            cursor: 'pointer',
            width: '400px',
            maxHeight: '300px',
            boxSizing: 'border-box',
          }}
        >
          <Typography variant="h4" onClick={handleClick} sx={{ color: 'black', '&:hover': {textDecoration: 'underline',}, }}>
            {cards[activeIndex].message}  <LaunchIcon fontSize = "large"/>
          </Typography>
          <Container className="mt-4">
          <Box display="flex" alignItems="center" gap={1}>

            <Select
              options={restaurantOptions}
              placeholder="Select a restaurant"
              onChange={(selectedOption) => {
                if (selectedOption) {
                  navigate('/search', {
                    state: {
                      searchTerm: selectedOption.label,
                      selectedCategories: [],
                      rating: 0,
                    },
                  });
                }
              }}
              styles={{
                container: (base) => ({
                  ...base,
                  width: '100%',
                }),
                control: (base) => ({
                  ...base,
                  boxShadow: 'none',
                  borderColor: '#ced4da',
                }),
              }}
            />
            {/* <Select
            className="border-0 shadow-none w-80" 
            options={restaurantOptions}
              isMulti
              value={searchTerm}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSubmit(e);
                }
              }}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                  disableUnderline: true,     
              }}
            >
              
            </Select> */}
      <IconButton 
        variant="outline-primary"
        className="m-0 p-0"
        onClick={() => setShowFilters(prev => !prev)}
        sx={{ color: 'black',display: 'flex', alignItems: 'center', justifyContent: 'center',}}
        size="large"
      >
        {showFilters ? <CloseIcon fontSize = "large"/> : <TuneIcon fontSize = "large"/>}
      </IconButton >
      </Box>
      {showFilters && (
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

        <Button variant="outline-primary" type="submit" style={{ marginTop: '10px' }}sx={{ color: 'black' }}>
          Filter
        </Button>
      </form>
      )}
      <Button 
            variant="contained" 
            color="primary" 
            sx={{ mt: 2 }} 
            onClick={() => navigate('/search')}
          >
            Explore All Restaurants
          </Button>
              </Container>
        </CardContent>
      </Card>
    </Box>}
    </>
  );
}

export default Home;
