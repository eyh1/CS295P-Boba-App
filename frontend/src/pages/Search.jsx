import { useState, useEffect, useCallback } from "react";
import boba from ".././assets/chafortea.png";
// import "../styles/Home.css"
import { Button, Grid, Grid2, Switch, FormControlLabel } from "@mui/material";
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
    }, 200);

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, [nextPageUrl, loading]);

  const buildUrl = (pageUrl = null) => {
    if (pageUrl) return pageUrl; // if next page URL already contains filters, use it directly

    const queryParams = new URLSearchParams();
    if (selectedCategories.length > 0) {
      queryParams.append('categories', selectedCategories.join(','));
    }
    if (rating) {
      queryParams.append('rating', rating);
    }
    return `/api/restaurants/?${queryParams.toString()}`;
  };

  const getRestaurants = (loadMore = false) => {
    setLoading(true);

    let url;
    if (loadMore && nextPageUrl) {
      const parsedUrl = new URL(nextPageUrl, window.location.origin);
      const queryParams = new URLSearchParams(parsedUrl.search);

      // Append current filters
      if (selectedCategories.length > 0) {
        queryParams.set('categories', selectedCategories.join(','));
      }
      if (rating) {
        queryParams.set('rating', rating);
      }

      parsedUrl.search = queryParams.toString();
      url = parsedUrl.toString().replace(window.location.origin, ''); // make it relative
    } else {
      url = buildUrl();
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

  // Get coordinates from address using OpenCage API
  const getCoordinatesFromAddress = async (address) => {
    const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`);
    const data = await response.json();
    if (data.status === "OK" && data.results.length > 0) {
      const { lat, lng } = data.results[0].geometry.location;
      return { latitude: lat, longitude: lng };
    }
    return null;
  };

  // Haversine formula helpers
  const toRadians = (deg) => (deg * Math.PI) / 180;

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of Earth in km
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
    const a = Math.sin(dLat / 2) ** 2 +
              Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
              Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Sort restaurants by distance from user
  const sortByDistance = async () => {
    if (sortedByDistance) {
      setRestaurants(originalRestaurants);
      setSortedByDistance(false);
      return;
    }

    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(async (position) => {
      const userLat = position.coords.latitude;
      const userLon = position.coords.longitude;

      const updated = await Promise.all(
        restaurants.map(async (rest) => {
          const coords = await getCoordinatesFromAddress(rest.address);
          if (coords) {
            const distance = getDistanceInMiles(
              { lat: userLat, lng: userLon },
              { lat: coords.latitude, lng: coords.longitude }
            );
            return { ...rest, distance };
          }
          return rest;
        })
      );

      const sorted = updated.slice().sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));
      setRestaurants(sorted);
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
      setRestaurants(data);
      setOriginalRestaurants(data);
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
  function EntryCard({ restaurant, pic_source, rating1, rating2, rating3, rest_id, address, restaurant_category_ratings, image, distance, restaurant_images }) {

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
              {console.log(entry)}
              <EntryCard
                key={index}
                pic_source={entry.restaurant_images?.[0]?.image}
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
      <TextField
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
      />
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
        <Button variant="outline-primary" type="submit" style={{ marginTop: '15px', backgroundColor: "#8CC6B3", // Set the button background color
    color: "white", }}>
          Apply Filter
        </Button>
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
