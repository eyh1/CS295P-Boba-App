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
import api from "../api";

const ReviewComponent = ({ reviews, setReviews, rest_id, refreshReviews }) => {
  const [isReviewing, setIsReviewing] = useState(false);
  const [reviewInputs, setReviewInputs] = useState({
    reviewer_Name: "",
    review_pricing: "",
    review_sweetness: "",
    is_public: true,
    review_content: "",
  });
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [categoryRatings, setCategoryRatings] = useState([]);

  useEffect(() => {
    api.get("api/category/")
      .then((res) => res.data)
      .then((data) => {
        setCategories(data);
      })
      .catch((error) => alert(error));
  }, []);

  const handleReviewChange = (field, value) => {
    setReviewInputs((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCategorySelect = (event) => {
    const categoryId = parseInt(event.target.value);
    const category = categories.find((cat) => cat.id === categoryId);
    if (category && !selectedCategories.includes(category)) {
      setSelectedCategories([...selectedCategories, category]);
      setCategoryRatings([...categoryRatings, { category: category.id, rating: 5 }]);
    }
  };

  const handleCategoryRatingChange = (categoryId, value) => {
    setCategoryRatings((prevRatings) =>
      prevRatings.map((rating) =>
        rating.category === categoryId ? { ...rating, rating: parseInt(value) } : rating
      )
    );
  };

  const handleSubmitReview = async () => {
    const reviewPayload = {
      content: reviewInputs.review_content,
      public: reviewInputs.is_public,
      pricing: parseFloat(reviewInputs.review_pricing),
      sweetness: parseFloat(reviewInputs.review_sweetness),
      review_category_ratings: categoryRatings,
    };

    try {
      await api.post(`/api/review/${rest_id}/create/`, reviewPayload);
      setReviewInputs({
        reviewer_Name: "",
        review_pricing: "",
        review_sweetness: "",
        is_public: true,
        review_content: "",
      });
      setIsReviewing(false);
      setSelectedCategories([]);
      setCategoryRatings([]);
      refreshReviews();
    } catch (error) {
      console.error("Error submitting review:", error);
      alert("We failed to receive your review.");
    }
  };

  return (
    <div className="text-center mt-3">
      {isReviewing ? (
        <div className="d-flex flex-column align-items-center">
            <select className="form-control mb-2 w-50" onChange={handleCategorySelect} defaultValue="">
            <option value="" disabled>Select a category to rate</option>
            {categories
              .filter((cat) => !selectedCategories.includes(cat))
              .map((category) => (
                <option key={category.id} value={category.id}>{category.category_name}</option>
              ))}
          </select>

         
          {selectedCategories.map((category) => (
            <div key={category.id} className="mb-2 w-50">
                <Card className="text-center shadow-sm border-0 rounded-pill bg-light px-3 py-2 mb-2 d-flex align-items-center justify-content-center">
                <div className="d-flex align-items-center w-100 justify-content-between">
                    <strong className="flex-grow-1 text-center">{category.category_name} Rating:</strong>
                    <select
                    className="form-select w-auto ms-2"
                    onChange={(e) => handleCategoryRatingChange(category.id, e.target.value)}
                    >
                    {[5, 4, 3, 2, 1].map((num) => (
                        <option key={num} value={num}>{num}</option>
                    ))}
                    </select>
                </div>
                </Card>
            </div>
            ))}

         
          <input
            type="number"
            className="form-control mb-2 w-50"
            placeholder="Pricing ($)"
            value={reviewInputs.review_pricing}
            onChange={(e) => handleReviewChange("review_pricing", e.target.value)}
          />
          <input
            type="number"
            className="form-control mb-2 w-50"
            placeholder="Sweetness (1-5)"
            value={reviewInputs.review_sweetness}
            onChange={(e) => handleReviewChange("review_sweetness", e.target.value)}
          />
          <textarea
            className="form-control mb-2 w-50"
            placeholder="Your Review"
            value={reviewInputs.review_content}
            onChange={(e) => handleReviewChange("review_content", e.target.value)}
          />
          <div className="form-check mb-2">
            <input
              type="checkbox"
              className="form-check-input"
              checked={reviewInputs.is_public}
              onChange={(e) => handleReviewChange("is_public", e.target.checked)}
            />
            <label className="form-check-label">Make this review public</label>
          </div>

          

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


// reviewer_Name, review_pricing, review_sweetness, is_public, review_content
// Main Restaurant Component
function Restaurant() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  // reviewer_Name, review_pricing, review_sweetness, is_public, review_content
  // some dummy reviews for testing
//   const [reviews, setReviews] = useState([
//     { reviewer_Name: "Eric", review_pricing: 5, review_sweetness: 4, is_public: true, review_content: "is gud" },
//     { reviewer_Name: "Eric", review_pricing: 21, review_sweetness: 3, is_public: false, review_content: "is very expensive" },
//   ]); 
  const location = useLocation();
  const { name_from_home, pic_from_home, ratings_from_home, rest_id } = location.state || {};
  const [reviews, setReviews] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [reviewJson, setReviewJson] = useState([]);
  const [currentRest, setCurrentRest] = useState();
  

  const checkLoginStatus = () => {
    const token = localStorage.getItem(ACCESS_TOKEN);
    setIsLoggedIn(!!token);
  };

  useEffect(() => {
    checkLoginStatus();
    if (rest_id) {
    getRestaurantReviews(rest_id);
    getRestaurants(rest_id);
  }
  }, [rest_id]);

  const getRestaurants = (id) => {
    api
      .get("api/restaurants/")
      .then((res) => res.data)
      .then((data) => { 
          setRestaurants(data); 
          
          if (data.length > 0 && data[0].restaurant_category_ratings) {
            const fetchedRests = data.filter(item => item.id === id);
            setCurrentRest((fetchedRests));
            console.log("rest data is", fetchedRests); 

        }})
      .catch((error) => alert(error));
    
    
    
  };


  const getRestaurantReviews = (id) => {
    api
      .get(`api/restaurant/${id}/reviews/`)
      .then((res) => res.data)
      .then((data) => {
        setReviewJson(data);
        console.log("Fetched reviews:", data);

        if (data.length > 0 && data[0].reviews) {
          const fetchedReviews = data[0].reviews.map((review) => ({
            reviewer_Name: review.username,  
            review_pricing: review.pricing, 
            review_sweetness: review.sweetness,  
            is_public: review.public,
            review_content: review.content, 
            review_category_ratings: review.review_category_ratings,
          }));

          setReviews((fetchedReviews));
        }
      })
      .catch((error) => alert(error));
  };

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

  function CategoryRatingCard({ category, rating }) {
  return (
    <Card className="shadow-sm border-0 bg-light px-2 py-1 mx-1 my-1" style={{ minWidth: "auto", fontSize: "0.9rem" }}>
      <Card.Body className="p-1 text-center">
        <strong>{category}:</strong> {rating} ⭐
      </Card.Body>
    </Card>
  );
}


  function ReviewCard({ reviewer_Name, review_pricing, review_sweetness, is_public, review_content, review_category_ratings }) {
  return (
    <Card className="text-center shadow-sm border-0 bg-light px-3 py-2 mb-2">
      <Card.Body className="p-2">
        <p><strong>{is_public ? reviewer_Name : "Anonymous"}'s Review:</strong></p>
        <p><strong>Price:</strong> ${review_pricing} <strong> Sweetness:</strong> {review_sweetness}</p>
        <p>{review_content}</p>

        <div className="d-flex flex-wrap justify-content-center mt-2">
          {review_category_ratings.map((category_rating, index) => (
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

  function EntryCard({ restaurant, pic_source, rating1, rating2, rating3, rest_id, restaurant_category_ratings}) {

    // console.log("categs is ", restaurant_category_ratings);
    
    return (
      <Card className="m-3 shadow-sm">
        <div className="card-grid-container-restaurant">
          <img src={pic_source} className="drink-cha" />
          <div className="card-inside-grid-container-restaurant">
            <h1 className="titleChaRestaurant">{restaurant}</h1>
            <div className="d-flex flex-wrap justify-content-center mt-2">
          {restaurant_category_ratings.map((category_rating, index) => (
            <CategoryRatingCard
              key={index}
              category={category_rating.category_name}
              rating={category_rating.rating}
            />
          ))}
        </div>
          </div>
        </div>
        <h1 className="titleChaRestaurant">Reviews:</h1>
        
        {isLoggedIn ? (
          <ReviewComponent reviews={reviews} setReviews={setReviews} rest_id={rest_id} refreshReviews={() => getRestaurantReviews(rest_id)}/>
        ) : (
          <Button variant="outline-primary" className="me-2" href="/login">
            Login to review
          </Button>
        )}

        <div className="grid-container-restaurant-review">
          {reviews.slice().reverse().map((entry, index) => (
            <ReviewCard
              key={index}
              reviewer_Name={entry.reviewer_Name}
              review_pricing={entry.review_pricing}
              review_sweetness={entry.review_sweetness}
              is_public={entry.is_public}
              review_content={entry.review_content}
              review_category_ratings={entry.review_category_ratings}
            />
          ))}
        </div>
      </Card>
    );
  }

  function CardGrid() {

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
          rest_id={rest_id}
          restaurant_category_ratings={currentRest ? (currentRest[0].restaurant_category_ratings) : ([{category_name: "Pilk Tea", rating: 3}])}
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
