import react from "react";
import SignIn1 from "../components/SignIn.jsx";
import { useNavigate } from "react-router-dom";
const SignIn=()=>{
    const navigate=useNavigate();
    return (
        <div className="flex min-h-screen flex-col bg-zinc-950">
            <div className="flex items-center justify-center gap-2 border-b border-zinc-800 px-4 py-3 text-sm">
                <p className="text-zinc-400">New User?</p>
                <button
                    type="button"
                    onClick={()=>navigate('/signup')}
                    className="font-medium text-white transition hover:text-zinc-300"
                >
                    Sign up
                </button>
            </div>
            <SignIn1/>
        </div>
    )
}
export default SignIn;
