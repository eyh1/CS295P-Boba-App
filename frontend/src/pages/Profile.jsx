import { useState, useEffect } from "react";
import api from "../api";
import { ACCESS_TOKEN } from "../constants";
import TopBar from "../components/TopBar";
import { Button, IconButton } from "@mui/material";
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import DeleteIcon from '@mui/icons-material/Delete';
import { Navbar, Nav, Container } from "react-bootstrap";
import { Card } from "react-bootstrap";

function Profile() {
    const [reviews, setReviews] = useState([]);
    const [categories, setCategories] = useState([]);


    useEffect(() => {
        fetchUserReviews();
        fetchCategories();
    }, []);

    const fetchUserReviews = async () => {
        const token = localStorage.getItem(ACCESS_TOKEN);
        try {
            const response = await api.get(`/api/users/reviews/`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setReviews(response.data);
        } catch (error) {
            console.error("Failed to fetch user reviews:", error);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await api.get(`/api/category/`);
            setCategories(response.data);
        } catch (error) {
            console.error("Failed to fetch categories:", error);
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
          <Card className="shadow-sm border-0 bg-light px-2 py-1 mx-1 my-1" style={{ minWidth: "auto", fontSize: "0.9rem" }}>
            <Card.Body className="p-1 text-center">
              <strong>{category}:</strong> {rating} ⭐
            </Card.Body>
          </Card>
        );
      }
    
    return <div>
    <TopBar/>
    <h1>Your Profile</h1>
    <h2>Your Reviews</h2>
    <p>Total Reviews Written: {reviews.length}</p>
    {reviews.length > 0 ? (
        <ul style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 0 }}>
            {reviews.map((review) => (
                <Card variant="outlined" sx={{ maxWidth: 360 }}>
                <Box sx={{ p: 2 }}>
                  <Stack
                    direction="row"
                    sx={{ justifyContent: 'space-between', alignItems: 'center' }}
                  > </Stack>
                    <Typography gutterBottom variant="h5" component="div">
                    {review.restaurant_name}
                    </Typography>
                    <Typography gutterBottom variant="h6" component="div">
                    ${review.pricing}
                    </Typography>
                  
                  <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                  {review.content}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Posted on: {formatDate(review.created_at)}
                  </Typography>
                  <div className="d-flex flex-wrap justify-content-center mt-2">
                    {review.review_category_ratings.map((category_rating, index) => (
                        <CategoryRatingCard
                        key={index}
                        category={category_rating.category_name}
                        rating={category_rating.rating}
                        />
                    ))}
                    </div>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Sweetness: {review.sweetness}
                    </Typography>

                </Box>
                <Divider />
                <Box sx={{ p: 2 }}>
                  <IconButton variant="contained" className = "delete-button" onClick={() => deleteReview(review.id)}>
                  <DeleteIcon fontSize="inherit" />
                   </IconButton>
                </Box>
              </Card>
            //     <Card variant="outlined" sx={{ maxWidth: 360 }}>
            //     <li key={review.id}>
            //     <Box sx={{ p: 2 }}>
            //         <h3>Restaurant Name: {review.restaurant_name}</h3>
            //         <p>Content: {review.content}</p>
            //         <p>Rating: {review.review_category_ratings[0].rating}</p>
            //         <p>Price: {review.pricing}</p>
            //         <p>Sweetness: {review.sweetness}</p>
            //         <p>Posted on: {formatDate(review.created_at)}</p>
            //         <button className="delete-button" onClick={() => deleteReview(review.id)}>
            //     Delete
            // </button>
            // </Box>
            //     </li>
            //     </Card>
            ))}
        </ul>
    ) : (
        <p>You have not made any reviews yet.</p>
    )}
</div>
}

export default Profile