import "../styles/TopBar.css"
import Zooba from "../assets/Zooba.png";
import { Button } from "@mui/material";
import { Navbar, Nav, Container } from "react-bootstrap";
import { useState, useEffect } from "react";
import { ACCESS_TOKEN } from "../constants";


function TopBar() {
    const returnHome = () => {
      window.location.href = "/";
    }
    const [isLoggedIn, setIsLoggedIn] = useState(false);

      const checkLoginStatus = () => {
        const token = localStorage.getItem(ACCESS_TOKEN);
        setIsLoggedIn(!!token);
      };

      const handleLogout = () => {
        localStorage.removeItem(ACCESS_TOKEN);
        setIsLoggedIn(false);
        navigate("/login");
      };

     useEffect(() => {
        checkLoginStatus();
      }, [])
    
  return (
    <Navbar style={{ backgroundColor: "#ccae88" }} expand="lg" className="px-3">
        <Navbar.Brand href="#">
          <img src={Zooba} alt="Zooba logo" width="50" height="50" onClick={returnHome}/>
          Zoba
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
          { isLoggedIn ? (<div>
            <Button variant="outline-primary" className="me-2" href="/profile">
              Profile
            </Button>
            <Button variant="outline-primary" className="me-2" onClick={handleLogout}>
                Logout
              </Button>
          </div>
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
    </Navbar>
  );
}

export default TopBar;