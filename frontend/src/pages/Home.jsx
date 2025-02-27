import { useState, useEffect } from "react";
import Zooba from ".././assets/Zooba.png";
import boba from ".././assets/chafortea.png";
import omomo from ".././assets/omomo.png";
import bako from ".././assets/bako.png";
import "../styles/Home.css"
import TextField from "@mui/material/TextField";
import { Button } from "@mui/material";
import api from "../api";
// import RestaurantList from "./RestaurantList";
// import Login from "./pages/Login";
// import { BrowserRouter, Route, Routes, Switch } from "react-router-dom";

function Home() {
  // const [restaurants, setRestaurants] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); // Use this state to help keep track of the searchbar and update the list of entries
  const [restaurants, setRestaurants] = useState([]);

  useEffect(() => {
    getRestaurants();
  }, [])

  const getRestaurants = () => {
    api
      .get("/api/restaurants/")
      .then((res) => res.data)
      .then((data) => { setRestaurants(data); console.log(data) })
      .catch((error) => alert(error));
  };
  // useEffect(() => {
  //   getRestaurants();
  // }, []);

  function TopBar() {
    return (
      <div
        style={{
          backgroundColor: "#e5ceb5",
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
        <h1 style={{color: "black", position: "absolute", left: "50%", transform: "translateX(-50%)", margin: 0 }}>Zoba</h1>
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
  // The card that contains the pics and cafe info
  function EntryCard({ restaurant, pic_source, rating1, rating2, rating3 }) { 
    return (
      <div className="entry-card">
        <div className="card-grid-container">
          <img src={pic_source} className="drink-cha" />
          <div className="card-inside-grid-container">
            <h1 className="titleCha">{restaurant} </h1>
            <RatingCard entry_name="Creme Brule" rating={rating1}></RatingCard>
            <RatingCard entry_name="Matcha" rating={rating2}></RatingCard>
            <RatingCard entry_name="Fruit Tea" rating={rating3}></RatingCard>
          </div>
        </div>
      </div>
    );
  }

  function CardGrid() {
    // List of restaurant entries, add as many as we need
    const entries = [
      { pic: boba, name: "Cha For Tea", ratings: ["5", "3", "4"] },
      { pic: omomo, name: "Omomo", ratings: ["3", "1", "5"] },
      { pic: bako, name: "Bako", ratings: ["2", "4", "2"] },
    ];

    // Filter based on whats in the search bar
    const filteredEntries = entries.filter((entry) =>
      entry.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
      <div className="grid-container">
        {filteredEntries.map((entry, index) => (
          <EntryCard
            key={index}
            pic_source={entry.pic}
            restaurant={entry.name}
            rating1={entry.ratings[0]}
            rating2={entry.ratings[1]}
            rating3={entry.ratings[2]}
          />
        ))}
      </div>
    );
  }


  // const getRestaurants = async () => {
  //   try {
  //     const response = await fetch("http://127.0.0.1:8000/api/restaurants");
  //     const data = await response.json();
  //     setRestaurants(data.restaurants);
  //   } catch (error) {
  //     console.log(error);
  //     alert(error);
  //   }
  // };

  return (
    <>
      <div>
        <TopBar />
        {/* <div className = "login_button">
            <form route="/login"/>
        </div> */}
        <div className="card">
          <div className="search"> 
            <TextField
              style={{ width: 500 }}
              id="outlined-basic"
              variant="outlined"
              label="Search for a drink or cafe"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)} // Update searchTerm on change
            />
            <CardGrid />
            {/* <RestaurantList restaurants={restaurants} /> */}
          </div>
        </div>
      </div>
    </>
  );
}

export default Home;
