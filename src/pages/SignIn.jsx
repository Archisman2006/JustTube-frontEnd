import react from "react";
import SignIn1 from "../components/SignIn.jsx";
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
            <SignIn1/>
        </div>
    )
}
export default SignIn;