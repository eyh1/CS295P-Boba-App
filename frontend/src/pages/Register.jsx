import Form from "../components/Form"
import TopBar from "../components/TopBar"

function Register() {
    return <div>
        <TopBar/>
        <Form route = "/api/user/register/" method = "register"/>
    </div>
    
}

export default Register