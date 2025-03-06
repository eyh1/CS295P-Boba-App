import "../styles/TopBar.css"
import Zooba from "../assets/Zooba.png";
import { Button } from "@mui/material";

const checkLoginStatus = () => {
    const token = localStorage.getItem(ACCESS_TOKEN);
    setIsLoggedIn(!!token);
  };

  const handleLogout = () => {
    localStorage.removeItem(ACCESS_TOKEN);
    setIsLoggedIn(false);
    navigate("/login");
  };

function TopBar() {
    const returnHome = () => {
        window.location.href = "/";
    }
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
          <img src={Zooba} className="zooba-logo" alt="Zooba logo" onClick={returnHome}/>
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

export default TopBar;