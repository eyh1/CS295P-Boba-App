import { useState, useEffect } from "react";
import Zooba from ".././assets/Zooba.png";
import boba from ".././assets/chafortea.png";
import omomo from ".././assets/omomo.png";
import bako from ".././assets/bako.png";
import "../styles/Home.css"
import TextField from "@mui/material/TextField";
import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { ACCESS_TOKEN } from "../constants";
import { Navbar, Nav, Container } from "react-bootstrap";
import { Card } from "react-bootstrap";
import TopBar from "../components/TopBar";
import Select from 'react-select';

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


function TopBar() {
    const returnHome = () => {
      window.location.href = "/";
    }
    
  return (
    <Navbar bg="light" expand="lg" className="px-3">
      <Container>
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
      </Container>
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
  function EntryCard({ restaurant, pic_source, rating1, rating2, rating3, rest_id, address, restaurant_category_ratings }) {
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
      <Card.Img variant="top" src={pic_source} />
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

    
    updatedRestaurants = updatedRestaurants.map(obj => {
      if(obj["restaurant_name"] == "Cha For Tea"){
          
          obj[bobaKey] = boba;
      }else{
          if(obj["restaurant_name"] == "Omomo"){
              obj[bobaKey] = omomo;
          }else{
              obj[bobaKey] = bako;
          }
          
      }
      
      return obj; // Return the updated map
    });
    const entries = updatedRestaurants;

    // Filter based on whats in the search bar
    const filteredEntries = entries.filter((entry) =>
      entry.restaurant_name.toLowerCase().includes(searchTerm.toLowerCase())
    );


    return (
      <div className="grid-container">
        {filteredEntries.map((entry, index) => (
          <EntryCard
            key={index}
            pic_source={entry.pic}
            restaurant={entry.restaurant_name}
            address = {entry.address}
            rating1={entry.ratings[0]}
            rating2={entry.ratings[1]}
            rating3={entry.ratings[2]}
            rest_id={entry.id}
            restaurant_category_ratings={entry.restaurant_category_ratings}
          />
        ))}
      </div>
    );
  }

  return (
    <>
      <TopBar />
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
        <fieldset>
          <legend>Select Categories:</legend>
            <Select
              options={categoryOptions}
              isMulti
              onChange={(selectedOptions) => {
                const selectedIds = selectedOptions.map((opt) => opt.value);
                setSelectedCategories(selectedIds);
              }}
              placeholder="Search and select categories..."
            />
        </fieldset>

        <div style={{ marginTop: '10px' }}>
          <label>
            Minimum Rating:
            <input
              type="number"
              value={rating}
              min="0"
              max="5"
              step="0.1"
              onChange={(e) => setRating(e.target.value)}
              style={{ marginLeft: '10px', width: '60px' }}
            />
          </label>
        </div>

        <Button variant="outline-primary" type="submit" style={{ marginTop: '15px' }}>
          Filter
        </Button>
      </form>
      )}
      {loading ? (
        <p>Loading...</p>
      ) : (
            <CardGrid />
    )}
          </div>

      </Container>
    </>
  );
}

export default Home;
