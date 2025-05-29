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
import Select from 'react-select';
import Autocomplete from '@mui/material/Autocomplete';

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

  const handleCategorySelect = (selectedOption, dropdownIndex) => {
    if (!selectedOption) return; // If no value is selected, return early
    
    const category = categories.find(cat => cat.id === selectedOption.value);
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
        { category: category.id, rating: 5 }, // Fixed: using category.id instead of category.value
      ]);
    } else { // selected category is topping
      const categoryId = selectedOption.value;
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
        return [...updatedRatings, { category: categoryId, rating: 5 }]; // Add the new topping rating
      });

      // Update the selected topping for this dropdown
      setToppingSelections((prev) => {
        const updatedSelections = [...prev];
        updatedSelections[dropdownIndex] = categoryId;
        return updatedSelections;
      });
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
          <label style={{ fontSize: "1.5rem" }}>Base</label>
          <div className="d-flex flex-column flex-md-row gap-2 w-50 w-md-100">
            <Select
              options={categories
                .filter(cat => cat.category_type === "Base")
                .map(category => ({
                  value: category.id,
                  label: category.category_name
                }))}
              placeholder="Select a base"
              onChange={(selectedOption) => handleCategorySelect(selectedOption, 0)}
              styles={{
                container: (base) => ({
                  ...base,
                  width: '100%',
                  position: 'relative',
                  zIndex: 2
                }),
                control: (base) => ({
                  ...base,
                  boxShadow: 'none',
                  borderColor: '#ced4da',
                  background: 'white',
                }),
                placeholder: (base) => ({
                  ...base,
                  color: '#757575',
                  background: 'transparent',
                }),
                singleValue: (base) => ({
                  ...base,
                  background: 'transparent',
                }),
                valueContainer: (base) => ({
                  ...base,
                  background: 'white',
                }),
                input: (base) => ({
                  ...base,
                  color: 'black',
                  background: 'transparent',
                }),
                menu: (base) => ({
                  ...base,
                  background: 'white',
                  zIndex: 3,
                }),
                option: (base) => ({
                  ...base,
                  background: 'white',
                  '&:hover': {
                    background: '#f0f0f0',
                  },
                }),
              }}
              theme={(theme) => ({
                ...theme,
                colors: {
                  ...theme.colors,
                  primary: '#8CC6B3',
                  primary25: '#f0f0f0',
                  neutral50: '#757575',  // placeholder color
                },
              })}
            />
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
                <Select
                  options={categories
                    .filter(cat => cat.category_type === "Topping" &&
                      (!toppingSelections.includes(cat.id) || toppingSelections[dropdownIndex] === cat.id))
                    .map(category => ({
                      value: category.id,
                      label: category.category_name
                    }))}
                  placeholder="Select any toppings"
                  value={categories
                    .filter(cat => cat.id === toppingSelections[dropdownIndex])
                    .map(category => ({
                      value: category.id,
                      label: category.category_name
                    }))[0]}
                  onChange={(selectedOption) => handleCategorySelect(selectedOption, dropdownIndex)}
                  styles={{
                    container: (base) => ({
                      ...base,
                      width: '100%',
                      position: 'relative',
                      zIndex: 2
                    }),
                    control: (base) => ({
                      ...base,
                      boxShadow: 'none',
                      borderColor: '#ced4da',
                      background: 'white',
                    }),
                    placeholder: (base) => ({
                      ...base,
                      color: '#757575',
                      background: 'transparent',
                    }),
                    singleValue: (base) => ({
                      ...base,
                      background: 'transparent',
                    }),
                    valueContainer: (base) => ({
                      ...base,
                      background: 'white',
                    }),
                    input: (base) => ({
                      ...base,
                      color: 'black',
                      background: 'transparent',
                    }),
                    menu: (base) => ({
                      ...base,
                      background: 'white',
                      zIndex: 3,
                    }),
                    option: (base) => ({
                      ...base,
                      background: 'white',
                      '&:hover': {
                        background: '#f0f0f0',
                      },
                    }),
                  }}
                  theme={(theme) => ({
                    ...theme,
                    colors: {
                      ...theme.colors,
                      primary: '#8CC6B3',
                      primary25: '#f0f0f0',
                      neutral50: '#757575',  // placeholder color
                    },
                  })}
                />
                <Rating
                  name="simple-controlled"
                  value={categoryRatings.find((r) => r.category === toppingSelections[dropdownIndex])?.rating || ""}
                  onChange={(e) =>
                    handleCategoryRatingChange(toppingSelections[dropdownIndex], e.target.value)
                  }
                />
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
            <button onClick={addToppingDropdown} className="w-50 w-md-100 btn" style={{ backgroundColor: "#8CC6B3", color: "black" }}>
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
              style={{
                backgroundColor: reviewInputs.is_public ? '#8CC6B3' : 'white',
                borderColor: '#8CC6B3'
              }}
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
  const [isBookmarked, setIsBookmarked] = useState(false);
    const [bookmarkId, setBookmarkId] = useState(null);
  // reviewer_Name, review_pricing, review_sweetness, is_public, review_content
  // some dummy reviews for testing
//   const [reviews, setReviews] = useState([
//     { reviewer_Name: "Eric", review_pricing: 5, review_sweetness: 4, is_public: true, review_content: "is gud" },
//     { reviewer_Name: "Eric", review_pricing: 21, review_sweetness: 3, is_public: false, review_content: "is very expensive" },
//   ]); 
  const location = useLocation();
  const { name_from_home, pic_from_home, ratings_from_home, rest_id } = location.state || {};
  // console.log("Restaurant page received state:", location.state); // Debug log
  const [reviews, setReviews] = useState([]);
  const [reviewJson, setReviewJson] = useState([]);
  const [currentRest, setCurrentRest] = useState();
  const [restaurantLatLng, setRestaurantLatLng] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const navigate = useNavigate();

  const formatDate = (dateString) => {
    if (!dateString) return "Date not available";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid date";
      
      const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      };
      return date.toLocaleString(undefined, options);
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Error formatting date";
    }
  };

  const getDirectionsUrl = (userLocation, address) => {
    const origin = userLocation ? `${userLocation.lat},${userLocation.lng}` : ""; // Return an empty string if userLocation is not available
    const destination = encodeURIComponent(address);
  
    return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}`;
  };
  // useEffect(() => {
  //   if (navigator.geolocation) {
  //     navigator.geolocation.getCurrentPosition(
  //       (position) => {
  //         setUserLocation({
  //           lat: position.coords.latitude,
  //           lng: position.coords.longitude
  //         });
  //       },
  //       (error) => {
  //         console.error("Error getting user location:", error);
  //       }
  //     );
  //   }
  // }, []);
  

  const checkLoginStatus = () => {
    const token = localStorage.getItem(ACCESS_TOKEN);
    setIsLoggedIn(!!token);
  };

  useEffect(() => {
      
    checkLoginStatus();
    if (rest_id) {
    getRestaurantReviews(rest_id);
    getRestaurants(rest_id);
    
    getBookmarks(rest_id);
    
    
  }
  }, [rest_id]);
    const getBookmarks = (rest_id) => {
        api.get("api/users/bookmarks/")
        .then(res => {
        const found = res.data.find(b => b.restaurant.id === rest_id);
        if (found) {
            setIsBookmarked(true);
            setBookmarkId(found.id);
        }
        })
        .catch(err => console.error("Failed to fetch bookmarks", err));
    }
  const getRestaurants = (id) => {
    api
      .get(`api/restaurant/${id}/reviews/`)  // Using the reviews endpoint which returns restaurant data
      .then((res) => res.data)
      .then((data) => { 
          if (data && data.length > 0) {
            const restaurant = data[0];  // The first item contains the restaurant data
            setCurrentRest([restaurant]);
            
            if (restaurant.address) {
              const fetchCoordinates = async () => {
                const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(restaurant.address)}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`);             
                const data = await response.json();
                const location = data.results[0]?.geometry.location;
                if (location) {
                  setRestaurantLatLng(location);
                }
              };
              fetchCoordinates();
            }
          } else {
            console.error("No restaurant found with ID:", id);
            alert("Restaurant not found");
          }
      })
      .catch((error) => {
        console.error("Error fetching restaurant:", error);
        alert("Error fetching restaurant details");
      });
  };


  const getRestaurantReviews = (id) => {
    // console.log("Fetching reviews for restaurant:", id);
    api
      .get(`api/restaurant/${id}/reviews/`)
      .then((res) => res.data)
      .then((data) => {
        setCurrentRest(data);
        setReviewJson(data);

        if (data.length > 0 && data[0].reviews) {
          const fetchedReviews = data[0].reviews.map((review) => {
            // console.log("Review created_at:", review.created_at); // Add this line for debugging
            return {
              reviewer_Name: review.username,  
              review_pricing: review.pricing, 
              review_sweetness: review.sweetness,  
              is_public: review.public,
              review_content: review.content, 
              review_category_ratings: review.review_category_ratings,
              created_at: review.created_at,
            };
          });

          setReviews(fetchedReviews);
        } else {
          // console.log("No reviews found for this restaurant");
          setReviews([]);
        }
      })
      .catch((error) => {
        console.error("Error fetching reviews:", error);
        alert("Error fetching restaurant reviews");
      });
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


  function ReviewCard({ reviewer_Name, review_pricing, review_sweetness, is_public, review_content, review_category_ratings, created_at }) {
  return (
    <Card
      sx={{
        textAlign: "center",
        boxShadow: 1,
        border: 0,
        backgroundColor: "white",
        px: 3,
        py: 2,
        mb: 4,
        borderRadius: 4,
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
        <p className="text-muted mt-3" style={{ fontSize: '0.9em' }}>Posted on: {formatDate(created_at)}</p>
      </CardContent>
    </Card>
  );
}

  function EntryCard({ restaurant, pic_source, rating1, rating2, rating3, rest_id, restaurant_category_ratings, address, restaurantLatLng, userLocation, restaurant_images }) {
    const [directions, setDirections] = useState(null);
    const navigate = useNavigate();

    const handleBookmark = () => {

        api.post(`api/bookmark/${rest_id}/create/`)
            .then((res) => {
            // alert("Restaurant bookmarked!");
            getBookmarks(rest_id)
            setIsBookmarked(true);
            
            })
            
            .catch((err) => {
            console.error(err);
        });
     };

    const handleRemoveBookmark = () => {
    api.delete(`api/bookmark/${bookmarkId}/delete/`)
        .then(() => {
        setIsBookmarked(false);
        setBookmarkId(null);
        })
        .catch(err => console.error("Failed to remove bookmark", err));
    };

    const handleLoginClick = () => {
      navigate('/login', { 
        state: { 
          from: '/restaurant',
          returnTo: {
            name_from_home: restaurant,
            pic_from_home: pic_source,
            ratings_from_home: [rating1, rating2, rating3],
            rest_id: rest_id
          }
        } 
      });
    };

    return (
      <Container>
        <Grid2 container spacing={1} sx={{marginTop:8, marginBottom: 2, marginLeft: 5, marginRight: 5 }}>
          <Grid2 size={{xs:12, md: 12}} justifyContent={"start"}>
          <div>
          <Box
  sx={{
    display: 'flex',
    overflowX: 'auto',
    gap: 0.5,
    padding: 1,
    scrollSnapType: 'x mandatory', // optional: for snapping
  }}
>
  {restaurant_images.map((item) => (
    <Box
      key={item.id}
      sx={{
        flex: '0 0 auto',
        width: 'clamp(140px, 40vw, 250px)', // fixed width or responsive via clamp
        scrollSnapAlign: 'start', // optional: for snapping
      }}
    >
      <img
        src={item.image}
        alt=""
        loading="lazy"
        style={{
          width: '100%',
          height: 'clamp(150px, 25vw, 200px)',
          objectFit: 'cover',
          borderRadius: '8px',
        }}
      />
    </Box>
  ))}
</Box>
          </div>
          <div style={{marginTop:4, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            {/* Title */}
            <h1 style={{ margin: 0 }}>{restaurant}</h1>
            {/* Login to Review / Write a Review button */}
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,  // spacing between buttons
                    width: "fit-content",
                }}
                > 

                {isLoggedIn && (
            isBookmarked ? (
                <Button
                variant="outlined"
                onClick={handleRemoveBookmark}
                sx={{
                    color: "red",
                    borderColor: "red",
                    mt: 1,
                    "&:hover": { backgroundColor: "#ffebeb" },
                }}
                >
                Remove Bookmark
                </Button>
            ) : (
                <Button
                variant="contained"
                onClick={handleBookmark}
                sx={{
                    mt: 1,
                    backgroundColor: "#8CC6B3",
                    color: "black",
                    "&:hover": {
                    backgroundColor: "#7bbba9",
                    color: "white",
                    },
                }}
                >
                Add Bookmark
                </Button>
            )
            ) }
                {isLoggedIn ? (
              <button className="btn btn-secondary" onClick={() => setIsReviewing(true)}>
                Write a Review
              </button>
                ) : (
                <Button
                  variant="contained"
                  onClick={handleLoginClick}
                  sx={{
                    "&:hover": {
                      color: "white",
                    },
                    fontSize: {
                      xs: '0.8rem', // smaller font size for mobile screens
                      sm: '1rem'    // default font size for larger screens
                    },
                    padding: {
                      xs: '10px 6px 6px 6px', // increased top padding for mobile (top, right, bottom, left)
                      sm: '8px 22px'  // default padding for larger screens
                    },
                    minWidth: {
                      xs: '120px', // smaller minimum width for mobile
                      sm: '140px'  // default minimum width for larger screens
                    }
                  }}
                  style={{ backgroundColor: "#8CC6B3", color: "black" }}
                >
                  Login to review
                </Button>
                )}

              </Box>
            

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

      <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 mt-2">
        <div className="grid grid-rows-2 grid-flow-col gap-1 pb-1 pr-1" style={{ minWidth: "max-content" }}>
          {restaurant_category_ratings.map((category_rating, index) => (
              <CategoryRatingCard
                key={index}
                category={category_rating.category_name}
                rating={category_rating.rating}
              />
            ))}
        </div>
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
              created_at={entry.created_at}
            />
          ))}
        </CardContent>
      </Container>
    );
  }

  function CardGrid() {
  const entries = [
    { 
      pic: currentRest?.[0]?.restaurant_images?.[0]?.image || pic_from_home || boba,
      name: currentRest?.[0]?.restaurant_name || name_from_home || "Restaurant Name",
    },
  ];

  return (
    <div>
      {entries.map((entry, index) => (
        <EntryCard
        key={index}
        pic_source={entry.pic}
        restaurant={entry.name}
        rest_id={rest_id}
        restaurant_category_ratings={currentRest ? (currentRest[0].restaurant_category_ratings) : ([{category_name: "Pilk Tea", rating: 3}])}
        address={currentRest ? currentRest[0].address : "No address available"}
        restaurantLatLng={restaurantLatLng}
        userLocation={userLocation}
        restaurant_images={currentRest?.[0] ? currentRest[0].restaurant_images : []}
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
