import { useState, useEffect } from "react";
import api from "../api";
import { ACCESS_TOKEN } from "../constants";
import TopBar from "../components/TopBar";
import { Button } from "@mui/material";

function Profile() {
    const [reviews, setReviews] = useState([]);

    useEffect(() => {
        fetchUserReviews();
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

    // const formatDate = (dateString) => {
    //     const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    //     return new Date(dateString).toLocaleDateString(undefined, options);
    // };
    
    return <div>
    {/* <TopBar/> */}
    <Button href = "/">Home</Button>
    <h1>Your Profile</h1>
    <h2>Your Reviews</h2>
    {reviews.length > 0 ? (
        <ul>
            {reviews.map((review) => (
                <li key={review.id}>
                    <h3>Restaurant Name: {review.restaurant_name}</h3>
                    <p>Content: {review.content}</p>
                    <p>Rating: {review.review_category_ratings[0].rating}</p>
                    <p>Price: {review.pricing}</p>
                    <p>Sweetness: {review.sweetness}</p>
                    <p>Posted on: {review.created_at}</p>
                </li>
            ))}
        </ul>
    ) : (
        <p>You have not made any reviews yet.</p>
    )}
</div>
}

export default Profile