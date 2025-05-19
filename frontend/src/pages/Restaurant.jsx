import { useState, useEffect } from "react";
import Zooba from ".././assets/Zooba.png";
import boba from ".././assets/chafortea.png";
import omomo from ".././assets/omomo.png";
import bako from ".././assets/bako.png";
import "../styles/Restaurant.css";
import { Button, Grid, Grid2 } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import TopBar from "../components/TopBar";
import { ACCESS_TOKEN } from "../constants";
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
// import { Navbar, Nav, Container } from "react-bootstrap";
import api from "../api";
import Rating from '@mui/material/Rating';
import TextField from "@mui/material/TextField";
import Container from '@mui/material/Container';
import {APIProvider, Map, Marker} from '@vis.gl/react-google-maps';
import Box from '@mui/material/Box';
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';

const ReviewComponent = ({ reviews, setReviews, rest_id, refreshReviews }) => {
  const [toppingDropdowns, setToppingDropdowns] = useState([]); // State to track dropdown instances
  const [showToppingDropdown, setShowToppingDropdown] = useState(false); // State to toggle visibility
  const [toppingSelections, setToppingSelections] = useState([]); // State to track selected values for each topping dropdown
  const addToppingDropdown = () => {
    setToppingDropdowns((prev) => [...prev, prev.length]); // Add a new dropdown instance
  };

  const removeToppingDropdown = (dropdownIndex) => {
    const toppingIdToRemove = toppingSelections[dropdownIndex];
  
    // Remove the selection at this index
    const updatedSelections = toppingSelections.filter((_, index) => index !== dropdownIndex);
    setToppingSelections(updatedSelections);
  
    // Remove the category and its rating
    setSelectedCategories((prev) => prev.filter((cat) => cat.id !== toppingIdToRemove));
    setCategoryRatings((prev) => prev.filter((rating) => rating.category !== toppingIdToRemove));
  
    // Reset dropdown indices to match new selections length
    setToppingDropdowns(updatedSelections.map((_, index) => index));
  };

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

  // Function to remove previously selected categories from the selected categories (when remove topping button is clicked)
  const handleCategoryRemove = (categoryId) => {
    // Filter out the category from selectedCategories
    setSelectedCategories(selectedCategories.filter((cat) => cat.id !== categoryId));
  
    // Filter out the corresponding rating from categoryRatings
    setCategoryRatings(categoryRatings.filter((rating) => rating.category !== categoryId));
  };

  const handleCategorySelect = (event, dropdownIndex) => {
    const categoryId = parseInt(event.target.value);
    const category = categories.find((cat) => cat.id === categoryId);
    // if (category && !selectedCategories.includes(category)) {
    //   setSelectedCategories([...selectedCategories, category]);
    //   setCategoryRatings([...categoryRatings, { category: category.id, rating: 5 }]);
    // }
    // if the selected category is "Base", remove any previously selected categories with category_type = "Base"
    if (category) {
      if (category.category_type === "Base") {
        // Remove any previously selected Base category
        setSelectedCategories((prev) =>
          prev.filter((cat) => cat.category_type !== "Base")
        );
        setCategoryRatings((prev) =>
          prev.filter((rating) => {
            const cat = categories.find((c) => c.id === rating.category);
            return cat && cat.category_type !== "Base";
          })
        );
  
        // Add the new Base category to selectedCategories and categoryRatings
        setSelectedCategories((prev) => [...prev, category]);
        setCategoryRatings((prev) => [
          ...prev,
          { category: category.id, rating: dropdownIndex }, // Default rating of 5
        ]);
      }
      else { // selected category is topping
        // Remove the previously selected topping for this dropdown
        setSelectedCategories((prev) => {
          const updatedCategories = prev.filter((cat) => {
            // Remove the previous topping for this dropdown
            return !(cat.category_type === "Topping" && toppingSelections[dropdownIndex] === cat.id);
          });
          return [...updatedCategories, category]; // Add the new topping
        });

        setCategoryRatings((prev) => {
          const updatedRatings = prev.filter((rating) => {
            // Remove the previous topping rating for this dropdown
            return !(rating.category === toppingSelections[dropdownIndex]);
          });
          return [...updatedRatings, { category: category.id, rating: 5 }]; // Add the new topping rating
        });

        // Update the selected topping for this dropdown
        setToppingSelections((prev) => {
          const updatedSelections = [...prev];
          updatedSelections[dropdownIndex] = categoryId;
          return updatedSelections;
        });
        return;
      }
    }
  };

  const handleCategoryRatingChange = (categoryId, value) => {
    const parsedValue = parseInt(value);

    setCategoryRatings((prevRatings) =>
      prevRatings.map((rating) =>
        rating.category === categoryId ? { ...rating, rating: parsedValue } : rating
      )
    );

    setSelectedCategories((prevCategories) =>
      prevCategories.map((cat) =>
        cat.id === categoryId ? { ...cat, rating: parsedValue } : cat
      )
    );
  };

  const handleSubmitReview = async () => {
    // Validate inputs
    if (selectedCategories.length === 0) {
      alert("You must select at least one category.");
      return;
    }
    if (categoryRatings.some(item => item.rating === undefined)) {
        alert("A rating is missing.");
        return;
      }
    if (categoryRatings.length === 0) {
      alert("You must provide ratings for the selected categories.");
      return;
    }
    if (!reviewInputs.review_sweetness) {
      alert("Sweetness cannot be blank.");
      return;
    }
    if (!reviewInputs.review_pricing) {
      alert("Pricing cannot be blank.");
      return;
    }
    if (isNaN(Number(reviewInputs.review_pricing))) {
        alert("Pricing must be a number.");
        return;
    }
    if (!reviewInputs.review_content) {
      alert("Review content cannot be blank.");
      return;
    }
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
      // getRestaurantReviews(rest_id);
    } catch (error) {
      console.error("Error submitting review:", error);
      alert("We failed to receive your review.");
    }
  };
  return (
    <div className="text-center mt-3">
      {isReviewing ? (
        <div className="d-flex flex-column align-items-center">
          {/* Base Dropdown */}
          <label style={{ fontSize: "1.5rem" }}>Base</label> {/* Add label above the dropdown */}
          <div className="d-flex flex-column flex-md-row gap-2 w-50 w-md-100">
            <select className="form-control" onChange={handleCategorySelect} defaultValue="">
              <option value="" disabled>Select a base</option>
                {categories
                .filter((cat) => cat.category_type === "Base")
                .map((category) => (
                  <option key={category.id} value={category.id}>{category.category_name}</option>
                ))}
            </select>
            {/* <select
              className="form-select w-auto ms-2"
              value={
                categoryRatings.find((r) => r.category === selectedCategories.find((cat) => cat.category_type === "Base")?.id)?.rating || ""
              }
              onChange={(e) =>
                handleCategoryRatingChange(
                  selectedCategories.find((cat) => cat.category_type === "Base")?.id,
                  e.target.value
                )
              }
            >
              {[5, 4, 3, 2, 1].map((num) => (
                <option key={num} value={num}>
                  {num}
                </option>
              ))}
            </select> */}
                  <Rating
              name="simple-controlled"
              value={categoryRatings.find((r) => r.category === selectedCategories.find((cat) => cat.category_type === "Base")?.id)?.rating || ""}
              onChange={(e) =>
                handleCategoryRatingChange(
                  selectedCategories.find((cat) => cat.category_type === "Base")?.id,
                  e.target.value
                )
              }
            />
          </div>
            {/* Topping Dropdowns */}
            <label style={{ fontSize: "1.5rem" }}>Toppings</label>
            {toppingDropdowns.map((dropdownIndex) => (
              <div key={dropdownIndex} className="d-flex flex-column flex-md-row gap-2 w-50 w-md-100 mb-2">
                <select
                  className="form-control me-2"
                  onChange={(e) => handleCategorySelect(e, dropdownIndex)}
                  value={toppingSelections[dropdownIndex] || ""}
                >
                  <option value="" disabled>Select any toppings</option>
                  {categories
                    .filter(
                      (cat) =>
                        cat.category_type === "Topping" &&
                      (!toppingSelections.includes(cat.id) || toppingSelections[dropdownIndex] === cat.id)
                  )
                  .map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.category_name}
                    </option>
                  ))}
                </select>
                {/* Rating for topping */}
                {/* <select
                  className="form-select w-auto"
                  value={
                    categoryRatings.find((r) => r.category === toppingSelections[dropdownIndex])?.rating || ""
                  }
                  onChange={(e) =>
                    handleCategoryRatingChange(toppingSelections[dropdownIndex], e.target.value)
                  }
                >
                  {[5, 4, 3, 2, 1].map((num) => (
                    <option key={num} value={num}>{num}</option>
                  ))}
                </select> */}
                <Rating
                  name="simple-controlled"
                  value={categoryRatings.find((r) => r.category === toppingSelections[dropdownIndex])?.rating || ""}
                  onChange={(e) =>
                    handleCategoryRatingChange(toppingSelections[dropdownIndex], e.target.value)
                  }
                />
                    {/* Remove Button */}
                    <button
                      onClick={() => {
                        removeToppingDropdown(dropdownIndex);
                      }}
                      className="btn btn-danger"
                    >
                      Remove
                    </button>
                </div>
  ))}
            {/* Button to add a new dropdown */}
            <button onClick={addToppingDropdown} className="w-50 w-md-100 btn btn-primary mb-2">
              Add a topping
            </button>

            {/* Previous rating dropdown */}
          {/* {selectedCategories.map((category) => (
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
            ))} */}

          <select
            className="form-control mb-2 w-50"
            value={reviewInputs.review_sweetness || ""}
            onChange={(e) => handleReviewChange("review_sweetness", e.target.value)}
          >
            <option value="" disabled>Sweetness</option>
            {["0", "25", "50", "75", "100", "125"].map((level) => (
              <option key={level} value={level}>{level}%</option>
            ))}
          </select>
          <TextField
            type="search"
            label="Pricing ($)"
            variant="outlined"
            className="mb-2 w-50"
            value={reviewInputs.review_pricing}
            onChange={(e) => handleReviewChange("review_pricing", e.target.value)}
            InputProps={{
              style: {
                backgroundColor: "white", // Set the input area background to white
              },
            }}
          />
          <TextField
            label="Your Review"
            variant="outlined"
            multiline
            rows={4}
            className="mb-2 w-50"
            value={reviewInputs.review_content}
            onChange={(e) => handleReviewChange("review_content", e.target.value)}
            InputProps={{
              style: {
                backgroundColor: "white", // Set the input area background to white
              },
            }}
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
        setIsReviewing(true),
        <p>hi</p>
      )}
    </div>
  );
};


// reviewer_Name, review_pricing, review_sweetness, is_public, review_content
// Main Restaurant Component
function Restaurant() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
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
  const [restaurantLatLng, setRestaurantLatLng] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const getDirectionsUrl = (userLocation, address) => {

    const origin = userLocation ? `${userLocation.lat},${userLocation.lng}` : ""; // Return an empty string if userLocation is not available
    const destination = encodeURIComponent(address);
  
    return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}`;
  };
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error("Error getting user location:", error);
        }
      );
    }
  }, []);
  

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
            if (fetchedRests.length > 0 && fetchedRests[0].address) {
              const fetchCoordinates = async () => {
                const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(fetchedRests[0].address)}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`);             
                const data = await response.json();
                const location = data.results[0]?.geometry.location;
                if (location) {
                  setRestaurantLatLng(location);
                }
              };
              fetchCoordinates();
            }
            // console.log("rest data is", fetchedRests); 

        }})
      .catch((error) => alert(error));
    
    
    
  };


  const getRestaurantReviews = (id) => {
    api
      .get(`api/restaurant/${id}/reviews/`)
      .then((res) => res.data)
      .then((data) => {
        setReviewJson(data);
        // console.log("Fetched reviews:", data);

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

  function CategoryRatingCard({ category, rating }) {
    return (
      <Card
        sx={{
          boxShadow: 1,
          border: 0,
          backgroundColor: "hsl(160, 36%, 85%)",
          py: .5, // Padding on the top and bottom
          mr: 1, // Margin on the left and right
          my: 1, // Margin on the top and bottom
          borderRadius: "20px", // Rounded corners
        }}
      >
        <CardContent className="p-1 text-center">
        <strong style={{ marginLeft: "5px", marginRight: "5px" }}>{category}:</strong>
          <Rating name="read-only" value={rating} readOnly precision={0.5} size="small" sx={{ verticalAlign: 'middle' }}/>
          </CardContent>
        </Card>
      );
    }


  function ReviewCard({ reviewer_Name, review_pricing, review_sweetness, is_public, review_content, review_category_ratings }) {
  return (
    <Card
  sx={{
    textAlign: "center", // Equivalent to "text-center"
    boxShadow: 1, // Equivalent to "shadow-sm"
    border: 0, // Equivalent to "border-0"
    backgroundColor: "white", // Equivalent to "bg-light"
    px: 3, // Padding on the left and right (px = padding-x)
    py: 2, // Padding on the top and bottom (py = padding-y)
    mb: 4, // Margin on the bottom (mb = margin-bottom)
    borderRadius: 4, // Adds rounded corners (4px radius)
  }}
>
      <CardContent className="p-2">
        <p><strong>{is_public ? reviewer_Name : "Anonymous"}'s Review:</strong></p>
        <p><strong>Price:</strong> ${review_pricing}<br></br> <strong> Sweetness:</strong> {review_sweetness}%</p>
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
      </CardContent>
    </Card>
  );
}

  function EntryCard({ restaurant, pic_source, rating1, rating2, rating3, rest_id, restaurant_category_ratings, address, restaurantLatLng, userLocation }) {
    const [directions, setDirections] = useState(null);

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

    const itemData = [
      {
        img: 'https://images.unsplash.com/photo-1549388604-817d15aa0110',
        title: 'Bed',
      },
      {
        img: 'https://images.unsplash.com/photo-1525097487452-6278ff080c31',
        title: 'Books',
      },
      {
        img: 'https://images.unsplash.com/photo-1523413651479-597eb2da0ad6',
        title: 'Sink',
      },
      {
        img: 'https://images.unsplash.com/photo-1563298723-dcfebaa392e3',
        title: 'Kitchen',
      },
      {
        img: 'https://images.unsplash.com/photo-1588436706487-9d55d73a39e3',
        title: 'Blinds',
      },
      {
        img: 'https://images.unsplash.com/photo-1574180045827-681f8a1a9622',
        title: 'Chairs',
      },
      {
        img: 'https://images.unsplash.com/photo-1530731141654-5993c3016c77',
        title: 'Laptop',
      },
      {
        img: 'https://images.unsplash.com/photo-1481277542470-605612bd2d61',
        title: 'Doors',
      },
      {
        img: 'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7',
        title: 'Coffee',
      },
      {
        img: 'https://images.unsplash.com/photo-1516455207990-7a41ce80f7ee',
        title: 'Storage',
      },
      {
        img: 'https://images.unsplash.com/photo-1597262975002-c5c3b14bbd62',
        title: 'Candle',
      },
      {
        img: 'https://images.unsplash.com/photo-1519710164239-da123dc03ef4',
        title: 'Coffee table',
      },
    ];

    return (
      <Container>
        <Grid2 container spacing={1} sx={{marginTop:8, marginBottom: 2, marginLeft: 5, marginRight: 5 }}>
          <Grid2 size={{xs:12, md: 12}} justifyContent={"start"}>
          <div>
          <Box sx={{borderRadius: "10px",  width: "auto", height: 250, overflowY: 'scroll' }}>
          <ImageList variant="masonry" cols={4} gap={8}>
  {itemData.map((item) => (
    <ImageListItem key={item.img}>
      <img
        srcSet={pic_source}
        src={pic_source}
        alt={item.title}
        loading="lazy"
        style={{
          // borderRadius: "10px", // Add rounded edges
        }}
      />
    </ImageListItem>
  ))}
</ImageList>
          </Box>
          </div>
          <div style={{marginTop:4, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            {/* Title */}
            <h1 style={{ margin: 0 }}>{restaurant}</h1>
            {/* Login to Review / Write a Review button */}
            {isLoggedIn ? (
              <button className="btn btn-secondary" onClick={() => setIsReviewing(true)}>
                Write a Review
              </button>
                ) : (
                <Button
                  variant="contained"
                  href="/login" state={{ from: location }}
                  sx={{
                    "&:hover": {
                      color: "white",
                    },
                  }}
                  style={{ backgroundColor: "#8CC6B3", color: "black" }}
                >
                  Login to review
                </Button>
                )}
          </div>

          {/* Distance Section */}
          <div style={{ textAlign: "left", marginTop: "5px" }}>
            <p style={{ margin: 0 }}>{address}</p> {/* Remove margin for the address */}
            {userLocation && restaurantLatLng && (
              <p style={{ margin: 0 }}> {/* Remove margin for the distance */}
                Distance: {getDistanceInMiles(userLocation, restaurantLatLng)} miles
              </p>
            )}
            <a
              href={getDirectionsUrl(userLocation, address)}
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: "none", color: "#007bff" }}
            >
              Get Directions
            </a>
          </div>
          <div className="d-flex flex-wrap justify-content-left mt-2">
            {restaurant_category_ratings.map((category_rating, index) => (
              <CategoryRatingCard
                key={index}
                category={category_rating.category_name}
                rating={category_rating.rating}
              />
            ))}
          </div>
          </Grid2>
          {/* old photo location */}
          {/* <Grid2 size={{ xs: 12, md: 6 }} display="flex" justifyContent="center">
            <img src={pic_source} className="drink-cha" />
          </Grid2> */}
          {/* Old map location */}
          {/* <Grid2 size={{ xs: 12, md: 6 }} display="flex" justifyContent="center">
            <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY} onLoad={() => console.log('Maps API has loaded.')}>
              <Map
                style={{
                  width: '100%',
                  height: '250px',
                  minWidth: 0
                }}
                defaultCenter={restaurantLatLng || { lat: 33.669445, lng: -117.823059 }} // UCI default
                defaultZoom={12}
                gestureHandling={'greedy'}
                disableDefaultUI={true}
              >
                {restaurantLatLng && <Marker position={restaurantLatLng} title="Restaurant" />}
                {/* {userLocation && <Marker position={userLocation} title="You" label="📍You" />} */}
                {/* {directions && <DirectionsRenderer directions={directions} />} */}
              {/* </Map>
            </APIProvider>
          </Grid2> */}
        </Grid2>
        {isReviewing && (
          <div style={{ marginTop: "20px" }}>
            <ReviewComponent
              reviews={reviews}
              setReviews={setReviews}
              rest_id={rest_id}
              refreshReviews={() => {
                getRestaurantReviews(rest_id);
                setIsReviewing(false); // Hide the ReviewComponent after submitting
              }}
            />
          </div>
        )}

        <h1 className="titleChaRestaurant">Reviews:</h1>
        
        <CardContent>
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
        </CardContent>
      </Container>
    );
  }

  function CardGrid() {

  const entries = [
    { pic: pic_from_home, name: name_from_home, ratings: [ratings_from_home[0], ratings_from_home[1], ratings_from_home[2]] },
  ];

  return (
    <div>
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
        address={currentRest ? currentRest[0].address : "No address available"}
        restaurantLatLng={restaurantLatLng}
        userLocation={userLocation}
      />
      ))}
    </div>
  );
}


  return (
    <>
      <div  style={{ backgroundColor: "hsl(160, 36%, 95%)", minHeight: "100vh" }}>
        <TopBar />
        <div>
          <CardGrid />
        </div>
      </div>
    </>
  );
}

export default Restaurant;
