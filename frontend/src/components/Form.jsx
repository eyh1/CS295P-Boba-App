import {useState} from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";
import "../styles/Form.css";

function Form({route, method}) {
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
                navigate("/") // navigate to home
            }
            else { // if we are registering, navigate to login
                navigate("/login")}
        }
        catch (error) {
            console.log(error);
            alert(error);
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