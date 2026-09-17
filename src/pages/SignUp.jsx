import react,{ useState } from "react";
import SignUp1 from "../components/SignUp.jsx";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from "../context/AuthContext.jsx";
import apiClient from "../services/api.js";
const SignUp=()=>{
    const navigate=useNavigate();
    const {login}=useAuth();
    const [error,setError]=useState("");
    const handleGoogleSuccess= async (credentialResponse)=>{
        try {
            setError("");
            const response=await apiClient.post('users/google-login',{
                token: credentialResponse.credential
            });
            if(response.data && response.data.success){
                if (response.data.data.usernameRequired) {
                    navigate('/finish-onboarding', { state: { tempToken: response.data.data.tempToken } });
                } else {
                    login(response.data.data.user, response.data.data.accessToken);
                    navigate('/');
                }
            }
        } catch (error) {
            console.log("Google Authentication Error: ",error);
            setError(error.response?.data?.message || 
            "Google Authentication failed. Please try again later")
        }
    };
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
            <div className="flex flex-col items-center justify-center mt-8 px-4">
                {error && (
                    <div className="mb-4 w-full max-w-md rounded-lg border border-red-500/30 bg-red-950/40 px-4 py-3 text-sm text-red-300 text-center">
                        {error}
                    </div>
                )}
                <div className="flex flex-col items-center gap-3 p-6 rounded-2xl border border-zinc-800 bg-zinc-900/40 w-full max-w-md shadow-lg shadow-black/20">
                    <p className="text-xs text-zinc-400 font-medium tracking-wide uppercase">Sign in with Google</p>
                    <div className="w-full flex justify-center">
                        <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={() => {
                            setError("Google Login Failed. Please Try Again.");
                            }}
                        theme="filled_dark"
                        shape="pill"
                        />
                    </div>
                </div>
            </div>
            <SignUp1/>
        </div>
    )
}
export default SignUp;
