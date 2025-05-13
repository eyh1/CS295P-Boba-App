import { useState, useEffect } from "react";
import "../styles/Home.css"
import Zooba from "../assets/Zooba.png";
import TextField from "@mui/material/TextField";
import { Button, Box, Card, CardMedia, CardContent, Typography, IconButton} from '@mui/material';
import { useNavigate } from "react-router-dom";
import api from "../api";
import { ACCESS_TOKEN } from "../constants";
import { Navbar, Nav, Container } from "react-bootstrap";
import TopBarInvis from "../components/TopBarInvis";
import TuneIcon from '@mui/icons-material/Tune';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import Select from 'react-select';
import Rating from '@mui/material/Rating';
import LaunchIcon from '@mui/icons-material/Launch';
import '@fontsource/poppins/500';

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
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
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

  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsFading(true); // Start fading out the current image
      setTimeout(() => {
        setActiveIndex((prevIndex) => (prevIndex + 1) % cards.length); // Switch to the next image
        setIsFading(false); // Fade in the new image
      }, 300); // Duration of the fade-out effect
    }, 5000); // Switch every 5 seconds
  
    return () => clearInterval(interval); // Cleanup
  }, [cards.length]);

  const handleClick = () => {
    navigate('/search', {
      state: {searchTerm: "",  selectedCategories: cards[activeIndex].categories, rating: cards[activeIndex].rating }
   });
  }; 

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
      {/* <TopBar setSearchTerm={setSearchTerm} setRestaurants={setRestaurants} loading={setLoading}/> */}
      <TopBarInvis/>
      
      {cards.length > 0 &&
      <Box
      sx={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        boxSizing: 'border-box',
        color: '#8CC6B3',
        backgroundColor: '#f0f0f0',
      }}
    >
      <Card
        sx={{
          width: '100%',
          height: '100%',
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 0,
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
            // borderRadius: 0,
            top: 0,
            left: 0,
            opacity: isFading ? .75 : 1, // Fade out when isFading is true
    transition: 'opacity 0.5s ease-in-out', // Smooth transition effect
          }}
        />

        <Box >
            
        <Box sx={{
            position: 'absolute',
            top: '20%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            // backgroundColor: 'rgba(255, 255, 255, .85)',
            color: 'black',
            padding: 2,
            borderRadius: 3,
            textAlign: 'center',
            width: '100%',
            maxHeight: '300px',
            boxSizing: 'border-box',
          }}>
            <Typography
                variant="h4"
                onClick={handleClick}
                sx={{
                textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)',
                fontWeight: '700',
                color: "white",
                fontFamily: 'Poppins',
                fontSize: 40,
                cursor: 'pointer',
                opacity: isFading ? 0.25 : 1, // Fade out when isFading is true
            //   visibility: isFading ? "hidden" : "visible", // Hide the text when fading out

            transition: "opacity 0.5s ease-in-out", // Smooth transition effect
            "&:hover": {
                textDecoration: "underline",
            },
            }}
        >
            {cards[activeIndex].message} -> 
            {/* <LaunchIcon fontSize="large" /> */}
            </Typography>
        </Box>
            
        {/* </CardContent> */}
            <CardContent
          sx={{
            position: 'absolute',
            top: '55%',
            left: '50%',
            transform: 'translate(-50%, -50%) scale(1.2)',
            backgroundColor: 'rgba(255, 255, 255, .85)',
            color: 'black',
            padding: 1,
            borderRadius: 3,
            textAlign: 'center',
            width: '400px',
            height: '270px',
            boxSizing: 'border-box',
          }}
        >
            
          <Container className="mt-4" >

          <form onSubmit={handleSubmit}>
          <fieldset>
            <Select
              options={restaurantOptions}
              placeholder="Select a restaurant"
              openMenuOnFocus={false}
              openMenuOnClick={false}
              value={selectedRestaurant}
              onChange={(selectedOption) => setSelectedRestaurant(selectedOption)}
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
            <Button
            fullWidth
              variant="contained"
              type="submit"
              sx={{ color: 'white', bgcolor: "#8CC6B3", mt: 1, borderRadius: 999 }}
              onClick={() => {
                if (selectedRestaurant) {
                  navigate('/search', {
                    state: {
                      searchTerm: selectedRestaurant.label,
                      selectedCategories: [],
                      rating: 0,
                    },
                  });
                }
              }}
            >
              Search by Restaurant
            </Button>
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
            <Typography variant="h6" sx={{ color: '#8CC6B3', marginTop: 1 }}>
              Or
            </Typography>

            <Box mt={0}>
              <Select
                isMulti
                value={selectedCategories}
                onChange={(selectedOptions) => {
                  setSelectedCategories(selectedOptions);
                }}
                placeholder="Search and select categories"
                openMenuOnFocus={false}
                openMenuOnClick={false}
                filterOption={(option, inputValue) => {
                  if (!inputValue) return true; // Show all if no input
                  return option.label.toLowerCase().includes(inputValue.toLowerCase());
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
                options={categoryOptions}
              />
            </Box>
            </fieldset>
        {/* <div style={{ marginTop: '10px' }}>
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
        </div> */}

        <Button variant="contained" type="submit" style={{ marginTop: '10px' }}sx={{ color: 'white', bgcolor: "#8CC6B3", mt: 1, borderRadius: 999 }}>
          Filter By Category
        </Button>
      </form>

      {/* <Button 
            variant="contained" 
            color="primary" 
            sx={{ mt: 2 }} 
            onClick={() => navigate('/search')}
          >
            Explore All Restaurants
          </Button> */}
              </Container>
        </CardContent></Box>
        
      </Card>
    </Box>}
    </>
  );
}

export default Home;
