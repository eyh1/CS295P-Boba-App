import Form from "../components/Form"
import TopBar from "../components/TopBar"

function Register() {
    return <div>
        <TopBar/>
        <h1 style={{ textAlign: 'center', marginTop: '20px', fontSize: '3rem', color: '#333' }}>
          Create an Account
        </h1>
        <Form route = "/api/user/register/" method = "register"/>
    </div>
    
}

export default Register