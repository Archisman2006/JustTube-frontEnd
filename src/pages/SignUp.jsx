import react from "react";
import SignUp1 from "../components/SignUp.jsx";
import { useNavigate } from "react-router-dom";
const SignUp=()=>{
    const navigate=useNavigate();
    return (
        <div>
            <div>
                <p>Already Signed up?</p>
                <button type="button" onClick={()=>navigate('/signin')}>
                    Sign In
                </button>
            </div>
            <SignUp1/>
        </div>
    )
}
export default SignUp;