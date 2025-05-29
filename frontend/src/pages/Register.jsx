import Form from "../components/Form"
import TopBar from "../components/TopBar"
import { useLocation } from "react-router-dom";

function Register() {
  const location = useLocation();
  const from = location.state || { from: "/" };
    return <div>
        <TopBar/>
        <div style={{ backgroundColor: " hsl(160, 36%, 95%)"}}>
        <h1 style={{ textAlign: 'center', marginTop: '0px', fontSize: '3rem', color: '#333' }}>
          Create an Account
        </h1>
        <Form route = "/api/user/register/" method = "register" from={from}/>
        </div>
    </div>
    
}

export default Register