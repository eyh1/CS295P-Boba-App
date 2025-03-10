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

// import RestaurantList from "./RestaurantList";
// import Login from "./pages/Login";
// import { BrowserRouter, Route, Routes, Switch } from "react-router-dom";

function Home() {
  const [searchTerm, setSearchTerm] = useState("");
  const [restaurants, setRestaurants] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  

  useEffect(() => {
    getRestaurants();
    checkLoginStatus();
  }, [])

  const getRestaurants = () => {
    api
      .get("/api/restaurants/")
      .then((res) => res.data)
      .then((data) => { setRestaurants(data); console.log(data) })
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
          { isLoggedIn ? (
          <Button variant="outline-primary" className="me-2" onClick={handleLogout}>
                Logout
              </Button>
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
  function EntryCard({ restaurant, pic_source, rating1, rating2, rating3, rest_id }) {
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
    <Card className="m-3 shadow-sm" style={{ cursor: "pointer" }} onClick={handleClick}>
      <Card.Img variant="top" src={pic_source} />
      <Card.Body>
        <Card.Title>{restaurant}</Card.Title>
        <Card.Text>
          <RatingCard entry_name="Creme Brule" rating={rating1} />
          <RatingCard entry_name="Matcha" rating={rating2} />
          <RatingCard entry_name="Fruit Tea" rating={rating3} />
        </Card.Text>
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
      obj[bobaKey] = bobaValue;
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
            // address = {entry.address}
            rating1={entry.ratings[0]}
            rating2={entry.ratings[1]}
            rating3={entry.ratings[2]}
            rest_id={entry.id}
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
            <CardGrid />
        
      </Container>
    </>
  );
}

export default Home;
