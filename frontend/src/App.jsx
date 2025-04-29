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
import Search from "./pages/Search";
import TestFyp from "./pages/TestFyp";
import TestCreateListBookmark from "./pages/TestCreateListBookmark";
import TestLatestReviews from "./pages/TestLatestReviews";
import RestaurantPlaceholder from "./pages/Restaurant";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';

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
        <Route path="/restaurant" element={<RestaurantPlaceholder/>} />
        <Route path="/search" element={<Search/>} />
        <Route path="/latest" element={<TestLatestReviews/>} />
        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
            </ProtectedRoute>
          }
          />
        <Route path="/test" element={
        <ProtectedRoute>
          <TestCreateListBookmark />
          </ProtectedRoute>
        }
        />
        <Route path="/fyp" element={
        <ProtectedRoute>
          <TestFyp/>
          </ProtectedRoute>
        }
        />
        <Route path="*" element={<NotFound />}></Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App;
