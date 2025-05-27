import "../styles/Login.css"
import petr from "../assets/petrdrink.png"
import Form from "../components/Form"
import Zooba from ".././assets/Zooba.png";
import { Button } from "@mui/material";
import TopBar from "../components/TopBar";
import { useLocation } from "react-router-dom";

function Login() {
    const location = useLocation();
    const from = location.state || { from: "/" };
    
    return (<>
    <TopBar/>
    <div style={{ backgroundColor: " hsl(160, 36%, 95%)"}}>
    <h1 style={{ textAlign: 'center', marginTop: '0px', fontSize: '3rem', color: '#333' }}>
          Login
        </h1>
    <Form route = "api/token/" method = "login" from={from}/>
    <p style={{ textAlign: 'center', fontSize: '1.5rem', marginTop: '16px' }}>
      <strong>New to Zoba? <a href="/register"><strong>Sign up</strong></a></strong>
    </p>
    </div>
    </>
    );
}

export default Login