import react from "react";
import SignIn from "../components/SignIn.jsx";
import { useNavigate } from "react-router-dom";
const SignIn1=()=>{
    const navigate=useNavigate();
    return (
        <div>
            <div>
                <p>New User?</p>
                <button type="button" onClick={()=>navigate('/signup')}>
                    Sign up
                </button>
            </div>
            <SignIn1/>
        </div>
    )
}
export default SignIn;