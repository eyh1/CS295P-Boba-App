import { useState, useEffect } from "react";
import "../styles/Home.css"
import TextField from "@mui/material/TextField";
import { Button, Box, Card, CardMedia, CardContent, Typography } from '@mui/material';
import { useNavigate } from "react-router-dom";
import api from "../api";
import { ACCESS_TOKEN } from "../constants";
import { Navbar, Nav, Container } from "react-bootstrap";
import TopBar from "../components/TopBar";

function Home() {
  const [searchTerm, setSearchTerm] = useState("");
  const [restaurants, setRestaurants] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [categories, setCategories] = useState([]);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(false);

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
            backgroundColor: 'rgba(255, 255, 255, .85)',
            color: 'black',
            padding: 2,
            borderRadius: 4,
            textAlign: 'center',
            cursor: 'pointer',
            width: '400px',
            minHeight: '300px',
            boxSizing: 'border-box',
          }}
        >
          <Typography variant="h4" onClick={handleClick} sx={{ color: 'black' }}>
            {/* {cards[activeIndex].message + ' 🔍'} */}
            <p>What's your type?</p>
          </Typography>
        </CardContent>
      </Card>
    </Box>
    );
  }
  }

  return (
    <>
      <TopBar setSearchTerm={setSearchTerm} setRestaurants={setRestaurants} loading={setLoading}/>
      
      <AlternatingCards />

    </>
  );
}

export default Home;
