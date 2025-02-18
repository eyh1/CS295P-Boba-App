function Login() {
    return <div>
        <h1>Login</h1>
        <form>
            <label><b>Username</b></label>
            <input type="text" placeholder = "Enter Username" name = "username" required/>
            <label><b>Password</b></label>
            <input type="password" placeholder = "Enter Password" name = "password" required/>
            <button>Login</button>
        </form>
    </div>
}

export default Login