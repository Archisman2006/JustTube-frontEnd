import react from "react";
import SignUp1 from "../components/SignUp.jsx";
import { useNavigate } from "react-router-dom";
const SignUp=()=>{
    const navigate=useNavigate();
    return (
        <div className="flex min-h-screen flex-col bg-zinc-950">
            <div className="flex items-center justify-center gap-2 border-b border-zinc-800 px-4 py-3 text-sm">
                <p className="text-zinc-400">Already Signed up?</p>
                <button
                    type="button"
                    onClick={()=>navigate('/signin')}
                    className="font-medium text-white transition hover:text-zinc-300"
                >
                    Sign In
                </button>
            </div>
            <SignUp1/>
        </div>
    )
}
export default SignUp;
