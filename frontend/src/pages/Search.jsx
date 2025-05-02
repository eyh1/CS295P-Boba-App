import { useState, useEffect } from "react";
import boba from ".././assets/chafortea.png";
import "../styles/Home.css"
import { Button, Grid, Grid2 } from "@mui/material";
import { useNavigate, useLocation  } from "react-router-dom";
import api from "../api";
import { ACCESS_TOKEN } from "../constants";
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import TopBar from "../components/TopBar";
import "../styles/Search.css"
import GradeIcon from '@mui/icons-material/Grade';



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
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [categories, setCategories] = useState([]);
  const [rating, setRating] = useState(initialRating);
  const [selectedCategories, setSelectedCategories] = useState(initialCategories);
  const [categoryRatings, setCategoryRatings] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(false);  
  
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
    .then((data) => { setRestaurants(data); })
    .catch((error) => alert(error));
    setLoading(false)
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
    if (selectedCategories.length > 0) {
      queryParams.append('categories', selectedCategories.join(','));
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
      <Card
        onClick={handleClick}
        sx={{
          m: 2,
          cursor: 'pointer',
          boxShadow: 3,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
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
                  width: '150px',
                  height: '40px',
                  display: 'flex',
                  justifyContent: 'center',
                }}
              >
                <CardContent sx={{ p: 1, textAlign: 'center', maxWidth: '150px' }}>
                  <Typography
                    variant="body2"
                    component="div"
                    sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <strong>{category_rating.category_name}: {category_rating.rating}<GradeIcon sx={{ fontSize: 16, ml: 0.5, alignSelf: 'center', position: 'relative', top: '-2px' }} /></strong>
                    
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
        <Grid2 container spacing={2} sx={{marginTop:2, marginBottom: 2, marginLeft: 5, marginRight: 5 }}>
        {filteredEntries.map((entry, index) => (
          <Grid2 key={index} size={{ xs: 12, md: 4 }} display="flex" flexDirection="column">
            <EntryCard
              key={index}
              pic_source={entry.image}
              restaurant={entry.restaurant_name}
              address = {entry.address}
              rating1={entry.ratings[0]}
              rating2={entry.ratings[1]}
              rating3={entry.ratings[2]}
              rest_id={entry.id}
              restaurant_category_ratings={entry.restaurant_category_ratings}
            />
            </Grid2>
          ))}
          </Grid2>
      </div>
    );
  }

  return (
    <>
      <TopBar setSearchTerm={setSearchTerm} setRestaurants={setRestaurants} setLoading={setLoading}/>
      <div className="text-center mt-1 mb-1">
        <a
          href="https://docs.google.com/forms/d/e/1FAIpQLSey_JXU-zUdcqNyEoszZtaoNbuZa_A6Ko7z6bzToO3c3tfImQ/viewform?usp=dialog"
          target="_blank"
          rel="noopener noreferrer"
        >
          Don&apos;t see your restaurant or drink option? Send a request to add it here!
        </a>
      </div>
      {loading ? (
        <p>Loading...</p>
      ) : (
            <CardGrid />
    )}
      
    </>
  );
}

export default Search;
