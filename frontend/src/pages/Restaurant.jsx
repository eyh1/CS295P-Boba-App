import { useState, useEffect } from "react";
import Zooba from ".././assets/Zooba.png";
import boba from "/public/chafortea.png";
import omomo from "/public/omomo.png";
import bako from "/public/bako.png";
import "../styles/Restaurant.css"
import { Button, TextField } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";

function Restaurant() {
  const [searchTerm, setSearchTerm] = useState(""); // Use this state to help keep track of the searchbar and update the list of entries
  const [showReviewForm, setShowReviewForm] = useState(false); // State to control the visibility of the review form
  const [newReview, setNewReview] = useState({
    reviewerName: "",
    drink: "",
    review: ""
  }); // State to store the data from the form

  const [reviews, setReviews] = useState([
    { reviewerName: "Eric", drink: "Black Tea Boba", review: "is gud" },
    { reviewerName: "Michael", drink: "Green Tea Boba", review: "is gud" },
    { reviewerName: "Destin", drink: "Matcha Latte Boba", review: "is gud" },
  ]);
    function ReviewForm() {
  const [newReview, setNewReview] = useState({
    reviewerName: '',
    drink: '',
    review: ''
  });

  const handleChange = (field) => (e) => {
    setNewReview({ ...newReview, [field]: e.target.value });
  };

  const handleSubmit = () => {
    console.log(newReview);  // Submit logic
  };

  return (
    <div>
      <TextField
        label="Name"
        variant="outlined"
        value={newReview.reviewerName}
        onChange={handleChange('reviewerName')}
        fullWidth
      />
      <TextField
        label="Drink"
        variant="outlined"
        value={newReview.drink}
        onChange={handleChange('drink')}
        fullWidth
      />
      <TextField
        label="Review"
        variant="outlined"
        value={newReview.review}
        onChange={handleChange('review')}
        fullWidth
      />
      <Button onClick={handleSubmit} variant="contained" color="primary">Submit Review</Button>
    </div>
  );
}
  function TopBar() {
    const navigate = useNavigate();
    const handleClick = () => {
      navigate("/");
    };
    return (
      <div
        onClick={handleClick}
        style={{
          backgroundColor: "#B3A494",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 70,
          padding: "0 20px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <img src={Zooba} className="Zooba logo" alt="Zooba logo" />
        </div>
        <h1 style={{ color: "#5E4C5A", position: "absolute", left: "50%", transform: "translateX(-50%)", margin: 0 }}>Zoba</h1>
        <Button
          className="loginButton"
          variant="contained"
          color="#6BAB90"
          href="/login"
        >
          Login
        </Button>
      </div>
    );
  }

  function RatingCard({ entry_name, rating }) {
    return (
      <div className="rating-card">
        {entry_name} {rating} ⭐
      </div>
    );
  }

  function ReviewCard({ reviewerName, drink, review }) {
    return (
      <div className="review-card">
        {reviewerName} reviewing {drink}: {review}
      </div>
    );
  }

  // The card that contains the pics and cafe info
  function EntryCard({ restaurant, pic_source, rating1, rating2, rating3 }) {
    const handleWriteReviewClick = () => {
      setShowReviewForm(true); // Show the review form when the button is clicked
    };

    return (
      <div className="entry-card-restaurant">
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
        <Button
          className="reviewButton"
          variant="contained"
          color="#FFFFFF"
          onClick={handleWriteReviewClick} // Trigger review form
        >
          <h1 className="buttonText">Write a review</h1>
        </Button>

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

        {showReviewForm && (
          <div className="review-form-popup">
            <TextField
              label="Name"
              variant="standard"
              value={newReview.reviewerName}
              onChange={(e) => setNewReview({ ...newReview, reviewerName: e.target.value })}
              fullWidth
            />
            <TextField
              label="Drink"
              variant="standard"
              value={newReview.drink}
              onChange={(e) => setNewReview({ ...newReview, drink: e.target.value })}
              fullWidth
            />
            <TextField
              label="Review"
              variant="standard"
              value={newReview.review}
              onChange={(e) => setNewReview({ ...newReview, review: e.target.value })}
              fullWidth
            />
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                setReviews([...reviews, newReview]); 
                setNewReview({ reviewerName: "", drink: "", review: "" }); 
                setShowReviewForm(false); 
              }}
            >
              Submit
            </Button>
            <Button
              variant="outlined"
              onClick={() => setShowReviewForm(false)} // Close the form without saving
            >
              Cancel
            </Button>
          </div>
        )}
      </div>
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