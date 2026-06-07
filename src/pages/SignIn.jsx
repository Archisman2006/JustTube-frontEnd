import react from "react";
import SignIn from "../components/SignIn.jsx";
import { useNavigate } from "react-router-dom";
const SignIn=()=>{
    const navigate=useNavigate();
    return (
        <div>
            <div>
                <p>New User?</p>
                <button type="button" onClick={()=>navigate('/signup')}>
                    Sign up
                </button>
            </div>
            <SignIn/>
        </div>
    )
}
export default SignIn;