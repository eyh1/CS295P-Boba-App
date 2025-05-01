import "../styles/Login.css"
import petr from "../assets/petrdrink.png"
import Form from "../components/Form"
import Zooba from ".././assets/Zooba.png";
import { Button } from "@mui/material";
import TopBar from "../components/TopBar";

function Login() {
  //   function TopBar() {
  //   return (
  //     <div
  //       style={{
  //         backgroundColor: "#B3A494",
  //         display: "flex",
  //         alignItems: "center",
  //         justifyContent: "space-between",
  //         height: 70,
  //         padding: "0 20px",
  //       }}
  //     >
  //       <div style={{ display: "flex", alignItems: "center" }}>
  //         <img src={Zooba} className="Zooba logo" alt="Zooba logo" />
  //       </div>
  //       <h1 style={{color: "#5E4C5A", position: "absolute", left: "50%", transform: "translateX(-50%)", margin: 0 }}>Zoba</h1>
  //       <Button
  //         className="backButton"
  //         variant="contained"
  //         color="#6BAB90"
  //         href="/"
  //       >
  //         Back
  //       </Button>
  //     </div>
  //   );
  // }

    return (<>
    <TopBar/>
    <h1 style={{ textAlign: 'center', marginTop: '20px', fontSize: '2rem', color: '#333' }}>
          Login
        </h1>
    <Form route = "api/token/" method = "login"/>
    </>
    );
    // return <div class = "login-container">
    //     <div class = "login-box">
    //         <img src = {petr} class = "petr-logo"/>
    //         <h1><b>Login</b></h1>
    //         <form>
    //             <label><b>Username</b></label>
    //             <input type="text" placeholder = "Enter Username" name = "username" required/>
    //             <label><b>Password</b></label>
    //             <input type="password" placeholder = "Enter Password" name = "password" required/>
    //             <button>Login</button>
    //         </form>
    //     </div>
    // </div>
}

export default Login