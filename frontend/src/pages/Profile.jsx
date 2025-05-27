import { useState, useEffect } from "react";
import api from "../api";
import { ACCESS_TOKEN } from "../constants";
import TopBar from "../components/TopBar";
import { CardMedia, Card, CardContent, Rating, Button, Grid, FormControl, InputLabel, Select,  Grid2, IconButton, MenuItem } from "@mui/material";
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import DeleteIcon from '@mui/icons-material/Delete';
import { Navbar, Nav, Container } from "react-bootstrap";
import { useNavigate  } from "react-router-dom";
// import { Card } from "react-bootstrap";
import Avatar from '@mui/material/Avatar';
import profilePic from "../assets/profile_pic.png";


function Profile() {
    const [reviews, setReviews] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedRestaurant, setSelectedRestaurant] = useState('');
    const [bookmarks, setBookmarks] = useState([]);
    const [recommendations, setRecommendations] = useState([]);
    const [showBookmarks, setShowBookmarks] = useState(false);

    const navigate = useNavigate();


    useEffect(() => {
        fetchUserReviews();
        fetchCategories();
        fetchBookmarks();
        fetchRecommendations();
    }, []);


    

    const fetchUserReviews = async () => {
        const token = localStorage.getItem(ACCESS_TOKEN);
        try {
            const response = await api.get(`/api/users/reviews/`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const sortedReviews = response.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            setReviews(sortedReviews);
            
        } catch (error) {
            console.error("Failed to fetch user reviews:", error);
        }
    };

    const uniqueRestaurantNames = [...new Set(reviews.map(r => r.restaurant_name))];

    const fetchCategories = async () => {
        try {
            const response = await api.get(`/api/category/`);
            setCategories(response.data);
        } catch (error) {
            console.error("Failed to fetch categories:", error);
        }
    };

    const fetchBookmarks = async () => {
        try {
            const response = await api.get(`api/users/bookmarks/`);
            setBookmarks(response.data);
            console.log(bookmarks);
        } catch (error) {
            console.error("Failed to fetch bookmarks:", error);
        }
    };

    const fetchRecommendations = async () => {
        try {
            const response = await api.get(`api/users/fyp/`);
            setRecommendations(response.data);
            console.log(response.data);
        } catch (error) {
            console.error("Failed to fetch recs:", error);
        }
    };

    const deleteReview = (id) => {
        api
            .delete(`/api/review/${id}/delete/`)
            .then((res) => {
                if (res.status === 204) alert("Review deleted!");
                else alert("Failed to delete review.");
                fetchUserReviews();
            })
            .catch((error) => alert(error));
    };

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    const getCategoryName = (categoryId) => {
        const category = categories.find(cat => cat.id === categoryId);
        return category ? category.category_name : "Unknown Category";
    };

    function CategoryRatingCard({ category, rating }) {
    return (
        <Card
        sx={{
            boxShadow: 1,
            border: 0,
            backgroundColor: "white",
            py: 0,
            mr: 1,
            my: 1   ,
            borderRadius: "20px",
            height: '40px'
        }}
        >
        <CardContent sx={{ p: 1, textAlign: "center" }}>
            <strong style={{ marginLeft: "5px", marginRight: "5px" ,}}>{category}:</strong>
            <Rating
            name="read-only"
            value={rating}
            readOnly
            precision={0.5}
            size="small"
            sx={{ verticalAlign: 'middle' }}
            />
        </CardContent>
        </Card>
    );
    }

    function BookmarkList() {
    

    const handleRest = (img_url, rest_name, rest_id) => {
    
    navigate("/restaurant", {
      state: {
        name_from_home: rest_name,
        pic_from_home: img_url,
        ratings_from_home: ["none", "none", "none"],
        rest_id: rest_id,
      },
    });
  };

    const handleDelete = async (bookmarkId) => {
    try {
        await api.delete(`api/bookmark/${bookmarkId}/delete/`);
        
        setBookmarks((prev) => prev.filter((bm) => bm.id !== bookmarkId));
    } catch (error) {
        console.error("Failed to delete bookmark:", error);
        alert("Failed to delete bookmark.");
    }
    };
    return (
        <Grid container direction="column" spacing={3}>
        {bookmarks.map((bookmark) => {
            const restaurant = bookmark.restaurant;
            const imageUrl =
            restaurant.restaurant_images?.[0]?.image ||
            profilePic;

            return (
            <Grid item key={bookmark.id}>
                <Card  sx={{ maxWidth: 400, borderRadius: 3, boxShadow: 3 }}>
                    
                <CardMedia
                    component="img"
                    height="200"
                    image={imageUrl}
                    alt={restaurant.restaurant_name}
                    onClick={() => handleRest(imageUrl, restaurant.restaurant_name, restaurant.id)}
                    sx={{'&:hover': {
                        cursor: 'pointer',
                    },}}
                />
                
                <CardContent>
                    
                    <Typography variant="h6" gutterBottom>
                    {restaurant.restaurant_name}
                    </Typography>

                    <Box
                        sx={{
                            px: 1,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                        }}
                        >
                        <Typography variant="body2" color="text.secondary">
                        {restaurant.address}
                    </Typography>
                        <IconButton
                        aria-label="delete"
                        onClick={() => handleDelete(bookmark.id)}
                        sx={{
                            position: "flex",
                            bgcolor: "rgba(255,255,255,0.8)",
                            "&:hover": {
                            bgcolor: "rgba(255,0,0,0.1)",
                            },
                        }}
                        >
                        <DeleteIcon color="error" />
                        </IconButton>

                    </Box>
                    
                </CardContent>
                </Card>
            </Grid>
            );
        })}
        </Grid>
    );
    }

    function RecommendationList() {
    

    const handleRest = (img_url, rest_name, rest_id) => {
    
    navigate("/restaurant", {
      state: {
        name_from_home: rest_name,
        pic_from_home: img_url,
        ratings_from_home: ["none", "none", "none"],
        rest_id: rest_id,
      },
    });
  };

    return (
        <Grid container direction="column" spacing={3}>
        {recommendations.map((recommendation) => {
            const restaurant = recommendation;
            const imageUrl =
            restaurant.restaurant_images?.[0]?.image ||
            profilePic;

            return (
            <Grid item key={recommendation.id}>
                <Card  sx={{ maxWidth: 400, borderRadius: 3, boxShadow: 3 }}>
                    
                <CardMedia
                    component="img"
                    height="200"
                    image={imageUrl}
                    alt={restaurant.restaurant_name}
                    onClick={() => handleRest(imageUrl, restaurant.restaurant_name, restaurant.id)}
                    sx={{'&:hover': {
                        cursor: 'pointer',
                    },}}
                />
                
                <CardContent>
                    
                    <Typography variant="h6" gutterBottom>
                    {restaurant.restaurant_name}
                    </Typography>

                    <Box
                        sx={{
                            px: 1,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                        }}
                        >
                        <Typography variant="body2" color="text.secondary">
                        {restaurant.address}
                    </Typography>
                       

                    </Box>
                    
                </CardContent>
                </Card>
            </Grid>
            );
        })}
        </Grid>
    );
    }
    
    return <div>
    <TopBar/>
    {/* <h1>Your Profile</h1> */}
    {/* Left side of page */}
    
    <Grid2 container spacing={2} sx={{marginTop:2, marginBottom: 2, marginLeft: 2, marginRight: 2, minHeight: 700, }}>
        <Grid2 size={{ xs: 12, md: 3 }} display="flex" flexDirection="column" alignItems="center" sx={{ height: 'fit-content',  padding: 2 }}>
            <Box display="flex" flexDirection="column" alignItems="center" sx={{ height: 'fit-content', width: '100%', border: '1px solid #ccc', borderRadius: '8px', padding: 2 }}>
                <img src={profilePic} alt="Profile" style={{ borderRadius: '50%', width: '150px', height: '150px' }} />
            {/* <p>Testname</p> */}
            <p>Total Reviews Written: {reviews.length}</p>
            <p>Bookmarked Restaurants: {bookmarks.length}</p>
            <Button
                onClick={() => {
                    fetchBookmarks();    
                    setShowBookmarks(prev => !prev); 
                }}
                variant="contained"
                sx={{
                    bgcolor: "#8CC6B3",
                    color: 'white',
                    borderRadius: 999,
                    minWidth: 80,
                    maxWidth: 150,
                    flexShrink: 1,
                    whiteSpace: 'nowrap',
                    ml: 1,
                    mr: 1,
                }}
                >
                {showBookmarks ? "Close Bookmarks" : "Open Bookmarks"}
                </Button>
            {showBookmarks && (
                <Box
                    sx={{
                    position: 'fixed',
                    top: 80,
                    bottom: 20,
                    width: 360,
                    bgcolor: 'white',
                    border: '1px solid #ccc',
                    borderRadius: 3,
                    boxShadow: 5,
                    overflowY: 'auto',
                    zIndex: 1200,
                    p: 2,
                    }}
                >
                    <Typography variant="h6" mb={2}>Bookmarked Restaurants
                    <Button
                        onClick={() => {
                            fetchBookmarks();    
                            setShowBookmarks(prev => !prev); 
                        }}
                        variant="contained"
                        sx={{
                            bgcolor: "#8CC6B3",
                            color: 'white',
                            borderRadius: 999,
                            minWidth: 80,
                            maxWidth: 150,
                            flexShrink: 1,
                            whiteSpace: 'nowrap',
                            ml: 1,
                            mr: 1,
                        }}
                        >
                        Close
                        </Button>
                    </Typography> 
                    <BookmarkList bookmarks={bookmarks} />
                </Box>
                )}
            </Box>
            <Box display="flex" flexDirection="column" alignItems="center" sx={{ maxHeight: '400px',   
        overflowY: 'auto', height: 'fit-content', width: '100%', border: '1px solid #ccc', borderRadius: '8px', padding: 2, mt: 2 }}>
               <Typography variant="h6" mb={2}>Recommended Restaurants </Typography>
               <RecommendationList></RecommendationList>
            </Box>
            
        </Grid2>

        
    
        {/* the review that take up right side of the page */}
        <Grid2
            size={{ xs: 12, md: 9 }}
            display="flex"
            flexDirection="column"
            alignItems="stretch" 
            >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5" sx={{mr: 1}}>Your Reviews</Typography>

            <FormControl size="small" sx={{ width: 180 }}>
                <InputLabel>Filter by Restaurant</InputLabel>
                <Select
                value={selectedRestaurant}
                onChange={(e) => setSelectedRestaurant(e.target.value)}
                label="Filter by Restaurant"
                >
                <MenuItem value="">All</MenuItem>
                {uniqueRestaurantNames.map((name, i) => (
                    <MenuItem key={i} value={name}>{name}</MenuItem>
                ))}
                </Select>
            </FormControl>
            </Box>


            {reviews.length > 0 ? (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, width: '100%' }}>
                {reviews.filter(r => !selectedRestaurant || r.restaurant_name === selectedRestaurant).map((review) => (
                    <li key={review.id} style={{ marginBottom: '24px', width: '100%' }}>
                    <Card
                        sx={{
                        width: '100%',
                        boxShadow: 2,
                        borderRadius: 3,
                        backgroundColor: 'white',
                        }}
                    >
                        <Box sx={{ p: 3 }}>
                        <Typography variant="h5" fontWeight="bold" gutterBottom>
                            {review.restaurant_name}
                        </Typography>

                        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mb: 2 }}>
                            {review.review_category_ratings.map((category_rating, index) => (
                            <CategoryRatingCard
                                key={index}
                                category={category_rating.category_name}
                                rating={category_rating.rating}
                            />
                            ))}
                        </Stack>

                        <Stack direction="row" spacing={2} sx={{ mb: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                            <strong>Sweetness:</strong> {review.sweetness}%
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                            <strong>Price:</strong> ${review.pricing}
                            </Typography>
                        </Stack>

                        <Typography variant="body1" color="text.primary" sx={{ mb: 1 }}>
                            {review.content}
                        </Typography>
                        </Box>

                        <Divider />

                        <Box
                        sx={{
                            px: 3,
                            py: 2,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                        }}
                        >
                        <Typography variant="body2" color="text.secondary">
                            Posted on: {formatDate(review.created_at)}
                        </Typography>
                        <IconButton
                            aria-label="delete"
                            onClick={() => deleteReview(review.id)}
                            sx={{ color: 'error.main' }}
                        >
                            <DeleteIcon />
                        </IconButton>
                        </Box>
                    </Card>
                    </li>
                ))}
                </ul>
            ) : (
                <p>You have not made any reviews yet.</p>
            )}
            </Grid2>

    </Grid2>
    
</div>

}

export default Profile