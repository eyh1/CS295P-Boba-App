import { useState, useEffect } from "react";
import "../styles/Home.css"
import Zooba from "../assets/Zooba.png";
import TextField from "@mui/material/TextField";
import { Button, Box, Card, CardMedia, CardContent, Typography, IconButton, Grid, CardHeader, Avatar, Divider} from '@mui/material';
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
import { Star, StarBorder, StarHalf, AttachMoney, CalendarToday } from "@mui/icons-material"

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
  const [latestReviews, setLatestReviews] = useState([])

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

  useEffect(() => {
      api.get("api/review/get_latest/")
        .then((res) => res.data)
        .then((data) => {
          setLatestReviews(data);
        })
        .catch((error) =>{

        console.log(error)});
    }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
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
<div style={{ backgroundColor: " hsl(160, 36%, 95%)"//"#f2f2f2" color of page
      , minHeight: "100vh" }}>
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Typography variant="h3" component="h1" align="center" gutterBottom sx={{pt:4, mb: 4, fontWeight: "bold", fontFamily: 'Poppins',
 } }>
        Latest Reviews
      </Typography>

      <Grid container spacing={3}>
        {latestReviews.map((review) => (
          <Grid item xs={12} sm={6} md={4} key={review.id}>
            <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
              <CardHeader
                avatar={<Avatar sx={{ bgcolor: '#8CC6B3' }}>{review.username.charAt(0).toUpperCase()}</Avatar>}
                title={
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography variant="subtitle1" component="span">
                      {review.username}
                    </Typography>
                    <Typography variant="subtitle1" component="span">
                      {"$ " + review.pricing}
                    </Typography>
                  </Box>
                }
                subheader={
                  <Box sx={{ display: "flex", alignItems: "center", mt: 0.5 }}>
                    <CalendarToday sx={{ fontSize: "0.875rem", mr: 0.5 }} />
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(review.created_at)}
                    </Typography>
                  </Box>
                }
                sx={{ pb: 0 }}
              />

              <CardContent sx={{ pt: 1, pb: 1, flexGrow: 1 }}>
                <Typography variant="h6" component="h2" gutterBottom>
                  {review.restaurant_name}
                </Typography>

                <Typography variant="subtitle1" component="span">
                      {"Sweetness: " + review.sweetness}
                    </Typography>

                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  {review.content === "" ? "No detailed review provided." : review.content}
                </Typography>

                <Divider sx={{ my: .5 }} />

                <Box sx={{ display: "flex", alignItems : "center", justifyContent: 'center', flexDirection: "row", gap: 1 }}>
                  {review.review_category_ratings.map((category_rating, index) => (
                    <Card
                key={index}
                sx={{
                  border: '.5px solid gray',
                  px: 1,
                  mx: 0.5,
                  my: 1,
                  fontSize: '0.8rem',
                  width: '140px',
                  height: 'auto',
                  display: 'flex',
                  justifyContent: 'center',
                  // color of individual rating for category
                  backgroundColor: "hsl(160, 36%, 98%)",
                  borderRadius: 2,
                }}
              >
                <CardContent sx={{ p: 1, textAlign: 'center', maxWidth: '150px',  }}>
                  <Typography
                    variant="body2"
                    component="div"
                    sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <strong>{category_rating.category_name}</strong>
                      <Rating
                        name={`read-only-${index}`}
                        value={parseFloat(category_rating.rating)}
                        precision={0.1}
                        readOnly
                        size="small"
                        sx={{ mt: 0.5 }}
                      />
                    </div>
                  </Typography>
                </CardContent>
              </Card>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
    </div>
    </>

  );
}

export default Home;
