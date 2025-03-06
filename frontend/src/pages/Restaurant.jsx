import { useState, useEffect } from "react";
import Zooba from ".././assets/Zooba.png";
import boba from ".././assets/chafortea.png";
import omomo from ".././assets/omomo.png";
import bako from ".././assets/bako.png";
import "../styles/Restaurant.css";
import { Button } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import TopBar from "../components/TopBar";
import { ACCESS_TOKEN } from "../constants";
import { Card } from "react-bootstrap";
import { Navbar, Nav, Container } from "react-bootstrap";

const ReviewComponent = ({ reviews, setReviews }) => {
  const [isReviewing, setIsReviewing] = useState(false);
  const [reviewInputs, setReviewInputs] = useState(["", "", ""]);

  const handleReviewChange = (index, value) => {
    const newReviews = [...reviewInputs];
    newReviews[index] = value;
    setReviewInputs(newReviews);
  };

  const handleSubmitReview = () => {
    
    setReviews([...reviews, { reviewerName: reviewInputs[0], drink: reviewInputs[1], review: reviewInputs[2] }]);
    
    setReviewInputs(["", "", ""]);
    setIsReviewing(false);
  };

  return (
    <div className="text-center mt-3">
      {isReviewing ? (
        <div className="d-flex flex-column align-items-center">
          <input
            type="text"
            className="form-control mb-2 w-50"
            placeholder="Name" 
            value={reviewInputs[0]}
            onChange={(e) => handleReviewChange(0, e.target.value)}
          />
          <input
            type="text"
            className="form-control mb-2 w-50"
            placeholder="Drink" 
            value={reviewInputs[1]}
            onChange={(e) => handleReviewChange(1, e.target.value)}
          />
          <input
            type="text"
            className="form-control mb-2 w-50"
            placeholder="Review" 
            value={reviewInputs[2]}
            onChange={(e) => handleReviewChange(2, e.target.value)}
          />
          <button className="btn btn-secondary" onClick={handleSubmitReview}>
            Submit Review
          </button>
        </div>
      ) : (
        <button className="btn btn-secondary" onClick={() => setIsReviewing(true)}>
          Write a Review
        </button>
      )}
    </div>
  );
};



// Main Restaurant Component
function Restaurant() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [reviews, setReviews] = useState([
    { reviewerName: "Eric", drink: "Black Tea Boba", review: "is gud" },
    { reviewerName: "Michael", drink: "Green Tea Boba", review: "is gud" },
    { reviewerName: "Destin", drink: "Matcha Latte Boba", review: "is gud" },
  ]);

  const checkLoginStatus = () => {
    const token = localStorage.getItem(ACCESS_TOKEN);
    setIsLoggedIn(!!token);
  };

  useEffect(() => {
    checkLoginStatus();
  }, []);
  function TopBar() {
    const returnHome = () => {
      window.location.href = "/";
    }

  const handleLogout = () => {
    localStorage.removeItem(ACCESS_TOKEN);
    setIsLoggedIn(false);
    navigate("/login");
  };
    
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

  function ReviewCard({ reviewerName, drink, review }) {
    return (
      <Card className="text-center shadow-sm border-0 rounded-pill bg-light px-3 py-2 mb-2">
        <Card.Body className="p-1">
          <strong>{reviewerName}</strong> reviewing <strong>{drink}</strong>: {review} 
        </Card.Body>
      </Card>
    );
  }

  function EntryCard({ restaurant, pic_source, rating1, rating2, rating3 }) {
    return (
      <Card className="m-3 shadow-sm">
        <div className="card-grid-container-restaurant">
          <img src={pic_source} className="drink-cha" />
          <div className="card-inside-grid-container-restaurant">
            <h1 className="titleChaRestaurant">{restaurant}</h1>
            <div className="ratings-container">
              <RatingCard entry_name="Creme Brule" rating={rating1} />
              <RatingCard entry_name="Matcha" rating={rating2} />
              <RatingCard entry_name="Fruit Tea" rating={rating3} />
            </div>
          </div>
        </div>
        <h1 className="titleChaRestaurant">Reviews:</h1>
        
        {isLoggedIn ? (
          <ReviewComponent reviews={reviews} setReviews={setReviews} />
        ) : (
          <Button variant="outline-primary" className="me-2" href="/login">
            Login to review
          </Button>
        )}

        <div className="grid-container-restaurant-review">
          {reviews.map((entry, index) => (
            <ReviewCard
              key={index}
              reviewerName={entry.reviewerName}
              drink={entry.drink}
              review={entry.review}
            />
          ))}
        </div>
      </Card>
    );
  }

  function CardGrid() {
    const location = useLocation();
    const { name_from_home, pic_from_home, ratings_from_home } = location.state || {};
    const entries = [
      { pic: pic_from_home, name: name_from_home, ratings: [ratings_from_home[0], ratings_from_home[1], ratings_from_home[2]] },
    ];

    return (
      <div className="grid-container-restaurant">
        {entries.map((entry, index) => (
          <EntryCard
            key={index}
            pic_source={entry.pic || boba}
            restaurant={entry.name}
            rating1={entry.ratings[0]}
            rating2={entry.ratings[1]}
            rating3={entry.ratings[2]}
          />
        ))}
      </div>
    );
  }

  return (
    <>
      <div>
        <TopBar />
        <div className="card">
          <CardGrid />
        </div>
      </div>
    </>
  );
}

export default Restaurant;
