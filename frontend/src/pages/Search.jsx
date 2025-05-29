import { useState, useEffect, useRef, useCallback } from "react";
import boba from ".././assets/chafortea.png";
// import "../styles/Home.css"
import { Button, Grid, Grid2, Switch, FormControlLabel, Box } from "@mui/material";
import { useNavigate, useLocation  } from "react-router-dom";
import api from "../api";
import { ACCESS_TOKEN } from "../constants";
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import TopBar from "../components/TopBar";
// import "../styles/Search.css"
import GradeIcon from '@mui/icons-material/Grade';
import Select from 'react-select';
import Rating from '@mui/material/Rating';
import TextField from "@mui/material/TextField";
import debounce from 'lodash.debounce';


// import RestaurantList from "./RestaurantList";
// import Login from "./pages/Login";
// import { BrowserRouter, Route, Routes, Switch } from "react-router-dom";

function Search() {
    const { state } = useLocation();
    const {
        searchTerm: initialSearchTerm = '',
        selectedCategories: initialCategories = [],
        rating: initialRating = ''
        } = state || {};
      
  const [searchTerm,setSearchTerm] = useState(initialSearchTerm);
  const [restaurants, setRestaurants] = useState([]);
  const [allRestaurants, setAllRestaurants] = useState([]);
  const [originalRestaurants, setOriginalRestaurants] = useState([]);
  const [sortedByDistance, setSortedByDistance] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [categories, setCategories] = useState([]);
  const [rating, setRating] = useState(initialRating);
  const [selectedCategories, setSelectedCategories] = useState(initialCategories);
  const [categoryRatings, setCategoryRatings] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(false);  
  const [nextPageUrl, setNextPageUrl] = useState("/api/restaurants/");
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const selectedCategoriesRef = useRef(selectedCategories);

  useEffect(() => {
    selectedCategoriesRef.current = selectedCategories;
  }, [selectedCategories]);

  const navigate = useNavigate();

  useEffect(() => {
    api.get("api/category/")
      .then((res) => res.data)
      .then((data) => {
        setCategories(data);
      })
      .catch((error) => alert(error));
  }, []);

  

  useEffect(() => {
    getRestaurants(false);
    getAllRestaurants();
    checkLoginStatus();
  }, [])

  useEffect(() => {
    const handleScroll = debounce(() => {
      if (
        window.innerHeight + window.scrollY >=
          document.body.offsetHeight - 300 && // 300px from bottom
        nextPageUrl &&
        !loading
      ) {
        getRestaurants(true);
      }
    }, 300);

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, [nextPageUrl, loading]);

  const buildUrl = (pageUrl = null, userLat = null, userLng = null) => {
    if (pageUrl) return pageUrl; // if next page URL already contains filters, use it directly

    const queryParams = new URLSearchParams();
    if (selectedCategories.length > 0) {
      queryParams.append('categories', selectedCategories.join(','));
    }

    if (userLat && userLng) {
      queryParams.set('lat', userLat);
      queryParams.set('lng', userLng);
    }

    return `/api/restaurants/?${queryParams.toString()}`;
  };

  const getAllRestaurants = () => {
    api
      .get("/api/restaurants/names/")
      .then((res) => res.data)
      .then((data) => { setAllRestaurants(data)})
      .catch((error) => alert(error));
  };

  const getRestaurants = (loadMore = false, userLat = null, userLng = null) => {
    setLoading(true);

    let url;
    if (loadMore && nextPageUrl) {
      const parsedUrl = new URL(nextPageUrl, window.location.origin);
      const queryParams = new URLSearchParams(parsedUrl.search);

      // Append current filters
      if ((selectedCategoriesRef.current).length > 0) {
        queryParams.set('categories', (selectedCategoriesRef.current).join(','));
      }
      if (userLat && userLng) {
        queryParams.set('lat', userLat);
        queryParams.set('lng', userLng);
      }
      parsedUrl.search = queryParams.toString();
      url = parsedUrl.toString().replace(window.location.origin, ''); // make it relative
    } else {
      url = buildUrl(null, userLat, userLng);
    }

    if (!url) {
      setLoading(false);
      return;
    }
    api
      .get(url)
      .then((res) => res.data)
      .then((data) => {
        if (loadMore) {
          setRestaurants((prev) => [...prev, ...data.results]);
          setOriginalRestaurants((prev) => [...prev, ...data.results]);
        } else {
          setRestaurants(data.results);
          setOriginalRestaurants(data.results);
        }
        setNextPageUrl(data.next);
      })
      .catch((error) => alert(error))
      .finally(() => setLoading(false));
};
  const checkLoginStatus = () => {
    const token = localStorage.getItem(ACCESS_TOKEN);
    setIsLoggedIn(!!token);
  };

      // Calculate distance in miles between two locations using the Haversine formula
      const getDistanceInMiles = (loc1, loc2) => {
        if (!loc1 || !loc2) return null;
        const toRad = (value) => (value * Math.PI) / 180;
        const R = 3958.8; // Earth's radius in miles
        const dLat = toRad(loc2.lat - loc1.lat);
        const dLng = toRad(loc2.lng - loc1.lng);
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(toRad(loc1.lat)) *
            Math.cos(toRad(loc2.lat)) *
            Math.sin(dLng / 2) *
            Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return (R * c).toFixed(2);
      };

  // Sort restaurants by distance from user
  const sortByDistance = async () => {
    if (sortedByDistance) {
      getRestaurants(false);
      setSortedByDistance(false);
      return;
    }

    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(async (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      getRestaurants(false, lat , lng);
      setSortedByDistance(true);
    }, () => {
      alert("Unable to retrieve your location.");
    });
  };

  const handleLogout = () => {
    localStorage.removeItem(ACCESS_TOKEN);
    setIsLoggedIn(false);
    navigate("/login");
  };

  const restaurantOptions = allRestaurants.map((allRestaurants) => ({
    value: allRestaurants.id,
    label: allRestaurants.restaurant_name.charAt(0).toUpperCase() + allRestaurants.restaurant_name.slice(1)
  }));

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
    if (selectedCategories.length > 0) {
      queryParams.append('categories', selectedCategories.join(','));
    }
    if (rating) {
      queryParams.append('rating', rating);
    }
    api
    .get(`/api/restaurants/?${queryParams.toString()}`)
    .then((res) => res.data)
    .then((data) => { 
      setRestaurants(data.results);
      setOriginalRestaurants(data.results);
      setNextPageUrl(data.next);
    })
    .catch((error) => alert(error));
    setLoading(false)
  };

  const categoryOptions = categories.map((category) => ({
    value: category.id,
    label: category.category_name.charAt(0).toUpperCase() + category.category_name.slice(1)
  }));
  
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
  function EntryCard({ restaurant, pic_source, rating1, rating2, rating3, rest_id, address, restaurant_category_ratings, image, distance }) {

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

  return (
      <Card
        onClick={handleClick}
        sx={{
          m: 2,
          cursor: 'pointer',
          boxShadow: 1,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 4,
        }}
      >
        <CardMedia
          component="img"
          image={pic_source}
          alt={restaurant}
          sx={{
            height: 200,
            objectFit: 'cover'
          }}
        />
        <CardContent sx={{ flexGrow: 1 }}>
          <Typography gutterBottom variant="h5" component="div">
            {restaurant}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {address}
          </Typography>
          {distance != null && (
            <Typography variant="body2" color="text.secondary" sx={{ marginTop: '4px' }}>
              {distance} miles away
            </Typography>
          )}
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", marginTop: 8}}>
            {restaurant_category_ratings.map((category_rating, index) => (
              <Card
                key={index}
                sx={{
                  border: '.5px solid gray',
                  px: 1,
                  mx: 0.5,
                  my: 1,
                  fontSize: '0.8rem',
                  width: '130px',
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
          </div>
        </CardContent>
      </Card>
  );
}

  function CardGrid() {
    // List of restaurant entries, add as many as we need
    const ratingsKey = 'ratings';
    const ratingsValue = ["5", "3", "4"];

    const bobaKey = 'pic';
    const bobaValue = boba;
    // Add the new field to each map in the list
    var updatedRestaurants = restaurants.map(obj => {
      obj[ratingsKey] = ratingsValue;
      return obj; // Return the updated map
    });

    const entries = updatedRestaurants;

    

    // Filter based on whats in the search bar
    const filteredEntries = entries.filter((entry) =>
      entry.restaurant_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
      <div>
        <Grid2
          container
          spacing={2}
          sx={{
            marginTop: 2,
            marginBottom: 2,
            marginLeft: { xs: 0, md: 5 },
            marginRight: { xs: 0, md: 5 }
          }}
        >
          {filteredEntries.map((entry, index) => (
            <Grid2 key={index} size={{ xs: 12, md: 4 }} display="flex" flexDirection="column">
              <EntryCard
                key={index}
                pic_source={entry.restaurant_image?.image}
                restaurant={entry.restaurant_name}
                address={entry.address}
                rating1={entry.ratings[0]}
                rating2={entry.ratings[1]}
                rating3={entry.ratings[2]}
                rest_id={entry.id}
                restaurant_category_ratings={entry.restaurant_category_ratings}
                distance={entry.distance}
              />
            </Grid2>
          ))}
        </Grid2>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: " hsl(160, 36%, 95%)"//"#f2f2f2" color of page
      , minHeight: "100vh" }}>
      <TopBar setSearchTerm={setSearchTerm} setRestaurants={setRestaurants} setLoading={setLoading}/>
      <Box sx={{maxWidth: "600px", margin: "0 auto",  justifyContent: 'center', mt: 2 }} >
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
              type="button"
              sx={{ color: 'white', bgcolor: "#8CC6B3", mt: 1, borderRadius: 999 }}
              onClick={(e) => {
                e.preventDefault();
                if (selectedRestaurant) {
                  console.log("Navigating to restaurant with state:", {
                    name_from_home: selectedRestaurant.label,
                    pic_from_home: "",
                    ratings_from_home: [],
                    rest_id: selectedRestaurant.value,
                  });
                  navigate("/restaurant", {
                    state: {
                      name_from_home: selectedRestaurant.label,
                      pic_from_home: "",
                      ratings_from_home: [],
                      rest_id: selectedRestaurant.value,
                    },
                  });
                } 
              }}
            >
              Search by Restaurant
            </Button> 
            </Box>
            {/* <Select>
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
              
            </Select>
      {/* <TextField
          variant="standard" 
          label="Search for a cafe"
          color="success"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSubmit(e);
            }
          }}
          style={{ width: '70%', minWidth: '30px', marginTop: '1rem', marginBottom: '10px'}}
      /> */}
      <div>
      
    <Button
      variant=""
      className="me-2"
      onClick={() => setShowFilters(prev => !prev)}
      style={{
        marginTop: '1rem',
        marginBottom: '10px',
        backgroundColor: "#8CC6B3",
        color: "black",
      }}
    >
      {showFilters ? 'Hide Filters ✖️' : "Filter by Category"}
    </Button>
    <FormControlLabel
      control={
        <Switch
          checked={sortedByDistance}
          onChange={sortByDistance}
          name="sortByDistance"
          color="primary"
        />
      }
      label="Sort by Distance"
    />
      {showFilters && (
      <form onSubmit={handleSubmit}>
          <Box sx={{maxWidth: "600px", display: "flex", margin: "0 auto",  justifyContent: 'center',  }} >
        <fieldset>
            <Select
              options={categoryOptions}
              isMulti
              onChange={(selectedOptions) => {
                const selectedIds = selectedOptions.map((opt) => opt.value);
                setSelectedCategories(selectedIds);
              }}
              placeholder="Search and select categories..."
              openMenuOnFocus={true}
              openMenuOnClick={true}
              isSearchable
              filterOption={(option, inputValue) => {
                if (!inputValue) return true;
                return option.label.toLowerCase().includes(inputValue.toLowerCase());
              }}
            />
        </fieldset>
        
        <Button variant="outline-primary" type="submit" style={{ marginLeft: '10px', backgroundColor: "#8CC6B3", // Set the button background color
    color: "white", }}>
          Apply Filter
        </Button>
        </Box>
      </form>
      
      )}
      <CardGrid />

      </div>
        {loading && <p>Loading...</p>}

      <div className="text-center mt-1 mb-1">
        <a
          href="https://docs.google.com/forms/d/e/1FAIpQLSey_JXU-zUdcqNyEoszZtaoNbuZa_A6Ko7z6bzToO3c3tfImQ/viewform?usp=dialog"
          target="_blank"
          rel="noopener noreferrer"
        >
          Don&apos;t see your restaurant or drink option? Send a request to add it here!
        </a>
      </div>
    </div>
  );
}

export default Search;
