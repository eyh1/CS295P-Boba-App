import "../styles/TopBar.css"
import Zooba from "../assets/Zooba.png";
import { Button } from "@mui/material";
import { Navbar, Nav, Container } from "react-bootstrap";
import { useState } from "react";


const checkLoginStatus = () => {
    const token = localStorage.getItem(ACCESS_TOKEN);
    setIsLoggedIn(!!token);
  };

  

  function TopBar() {
    const returnHome = () => {
      window.location.href = "/";
    }
    const [isLoggedIn, setIsLoggedIn] = useState(false);

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
          <Button
            className="logoutButton"
            variant="contained"
            color="#6BAB90"
            onClick={handleLogout}
          >
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

export default TopBar;