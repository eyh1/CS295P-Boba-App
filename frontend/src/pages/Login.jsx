import "../styles/Login.css"
import petr from "../assets/petrdrink.png"

function Login() {
    return <div class = "login-container">
        <div class = "login-box">
            <img src = {petr} class = "petr-logo"/>
            <h1><b>Login</b></h1>
            <form>
                <label><b>Username</b></label>
                <input type="text" placeholder = "Enter Username" name = "username" required/>
                <label><b>Password</b></label>
                <input type="password" placeholder = "Enter Password" name = "password" required/>
                <button>Login</button>
            </form>
        </div>
    </div>
}

export default Login