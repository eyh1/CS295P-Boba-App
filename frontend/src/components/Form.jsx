import {useState} from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";
import "../styles/Form.css";

function Form({route, method, from}) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const name = method === "login" ? "Login" : "Register";

    const handleSubmit = async (e) => {
        setLoading(true);
        e.preventDefault();

        try {
            const res = await api.post(route, {username, password})
            if (method === "login") {
                localStorage.setItem(ACCESS_TOKEN, res.data.access)
                localStorage.setItem(REFRESH_TOKEN, res.data.refresh)
                if (from.from === '/restaurant' && from.returnTo) {
                    navigate(from.from, { state: from.returnTo })
                } else {
                    navigate(from.from || '/') // fallback to home if no specific return path
                }
            }
            else { // if we are registering, login automatically
                const loginRes = await api.post("/api/token/", {username, password})
                localStorage.setItem(ACCESS_TOKEN, loginRes.data.access)
                localStorage.setItem(REFRESH_TOKEN, loginRes.data.refresh)
                if (from.from === '/restaurant' && from.returnTo) {
                    navigate(from.from, { state: from.returnTo })
                } else {
                    navigate(from.from || '/') // fallback to home if no specific return path
                }
            }
        }
        catch (error) {
            console.log(error);
             if (error.response?.data?.username) {
                alert("Username already exists: " + error.response.data.username[0]);
            } else if (error.response?.data?.password) {
                alert("Password error: " + error.response.data.password[0]);
            } else {
                alert("Registration failed: " + (error.response?.data?.detail || error.message));
            }
        }
        finally {
            setLoading(false);
        }
    }

    if (loading) {
        return (
            <div className="loading-screen">
                <div className="spinner"></div>
            </div>
        );
    }

    return<div style={{ backgroundColor: " hsl(160, 36%, 95%)"}}>
        <form onSubmit = {handleSubmit} className = "form-container">
        {/* <h1>{name}</h1> */}
        <input
            className = "form-input"
            type = "text"
            value = {username}
            onChange = {(e) => setUsername(e.target.value)}
            placeholder = "Username"
            style={{
                backgroundColor: "white",
                color: "black",
              }}
        />
        <input
            className = "form-input"
            type = "password"
            value = {password}
            onChange = {(e) => setPassword(e.target.value)}
            placeholder = "Password"
            style={{
                backgroundColor: "white",
                color: "black",
              }}
        />
        <button className = "btn btn-secondary btn-lg btn-block" type = "submit">
            {name}
        </button>
    </form>
    </div>
}

export default Form