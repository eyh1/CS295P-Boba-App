import { useState, useEffect } from "react";
import petr from "./assets/petrdrink.png";
import boba from "./assets/chafortea.png";
import omomo from "./assets/omomo.png";
import bako from "./assets/bako.png";
import "./App.css";
import TextField from "@mui/material/TextField";
import RestaurantList from "./RestaurantList";
import Login from "./pages/Login";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import Register from "./pages/Register";
import ProtectedRoute from "./components/ProtectedRoute";
import Profile from "./pages/Profile";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";

function Logout() {
  localStorage.clear()
  return <Navigate to="/login" />
}

function RegisterAndLogout() {
  localStorage.clear()
  return <Register />
}

function App() {
  // const [restaurants, setRestaurants] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); // Use this state to help keep track of the searchbar and update the list of entries

  // useEffect(() => {
  //   getRestaurants();
  // }, []);

  function TopBar() {
    return (
      <div
        style={{
          backgroundColor: "#529176",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: 70,
        }}
      >
        <img src={petr} className="Petr logo" />
        <h1 className="textZoba">Zoba</h1>
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
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<Home />}
        />
        <Route path="/login" element={<Login />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/register" element={<RegisterAndLogout />} />
        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
            </ProtectedRoute>
          }
          />
        <Route path="*" element={<NotFound />}></Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App;
