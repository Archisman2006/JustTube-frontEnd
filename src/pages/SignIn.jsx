import React, { useState } from "react";
import SignIn1 from "../components/SignIn.jsx";
import { useNavigate, useLocation } from "react-router-dom";
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from "../context/AuthContext.jsx";
import apiClient from "../services/api.js";

const SignIn=()=>{
    const navigate=useNavigate();
    const location=useLocation();
    const {login}=useAuth();
    const [error,setError]=useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [forgotEmail, setForgotEmail] = useState("");
    const [forgotLoading, setForgotLoading] = useState(false);
    const [modalError, setModalError] = useState("");
    const [modalSuccess, setModalSuccess] = useState("");

    const successMsg = location.state?.successMessage;
    
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
                    login(response.data.data.user);
                    navigate('/');
                }
            }
        } catch (error) {
            console.log("Google Authentication Error: ",error);
            setError(error.response?.data?.message || 
            "Google Authentication failed. Please try again later")
        }
    };

    const handleForgotPasswordSubmit = async (e) => {
        e.preventDefault();
        if (!forgotEmail.trim()) return;
        setForgotLoading(true);
        setModalError("");
        try {
            await apiClient.post("users/generate-reset-password-token", {
                email: forgotEmail.trim(),
            });
            setModalSuccess("If that email exists, a mail has been sent to the email to proceed further.");
        } catch (err) {
            console.log("Forgot Password Error: ", err);
            setModalError(
                err?.response?.data?.message ||
                "Failed to send reset link. Please try again."
            );
        } finally {
            setForgotLoading(false);
        }
    };

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
            
            <div className="flex flex-col items-center justify-center mt-8 px-4">
                {successMsg && (
                    <div className="mb-4 w-full max-w-md rounded-lg border border-emerald-500/30 bg-emerald-950/40 px-4 py-3 text-sm text-emerald-300 text-center">
                        {successMsg}
                    </div>
                )}
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
            <SignIn1/>
            
            <div className="flex justify-center pb-8">
                <button
                    type="button"
                    onClick={() => {
                        setIsModalOpen(true);
                        setModalError("");
                        setModalSuccess("");
                        setForgotEmail("");
                    }}
                    className="text-xs text-zinc-400 transition hover:text-zinc-200 underline underline-offset-4 focus:outline-none cursor-pointer"
                >
                    Forgot Password?
                </button>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-fade-in">
                    <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl shadow-black/80">
                        <h3 className="mb-4 text-xl font-semibold text-white">Reset Password</h3>
                        
                        {modalError && (
                            <div className="mb-4 rounded-lg border border-red-500/30 bg-red-950/40 px-4 py-3 text-sm text-red-300">
                                {modalError}
                            </div>
                        )}
                        
                        {modalSuccess ? (
                            <div>
                                <p className="mb-6 text-sm text-zinc-300">{modalSuccess}</p>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsModalOpen(false);
                                        setModalSuccess("");
                                        setForgotEmail("");
                                    }}
                                    className="w-full rounded-lg bg-white py-2.5 text-sm font-semibold text-zinc-950 hover:bg-zinc-200 transition-colors cursor-pointer animate-pulse-subtle"
                                >
                                    Done
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleForgotPasswordSubmit}>
                                <p className="mb-4 text-xs text-zinc-400">
                                    Enter your email address below and we'll send you a link to reset your password.
                                </p>
                                <div className="mb-4">
                                    <label className="mb-1.5 block text-sm font-medium text-zinc-300">Email Address</label>
                                    <input
                                        type="email"
                                        required
                                        value={forgotEmail}
                                        onChange={(e) => {
                                            setForgotEmail(e.target.value);
                                            if (modalError) setModalError("");
                                        }}
                                        placeholder="Enter your email"
                                        className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-2.5 text-white placeholder:text-zinc-500 focus:border-zinc-500 focus:outline-none transition-colors"
                                    />
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsModalOpen(false);
                                            setModalError("");
                                            setForgotEmail("");
                                        }}
                                        className="w-1/2 rounded-lg border border-zinc-700 bg-transparent py-2.5 text-sm font-semibold text-zinc-300 hover:bg-zinc-800 transition-colors cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={!forgotEmail.trim() || forgotLoading}
                                        className={`w-1/2 rounded-lg py-2.5 text-sm font-semibold transition-all duration-200 ${
                                            forgotEmail.trim() && !forgotLoading
                                                ? "bg-white text-zinc-950 hover:bg-zinc-200 cursor-pointer"
                                                : "cursor-not-allowed bg-zinc-800 text-zinc-500"
                                        }`}
                                    >
                                        {forgotLoading ? "Sending..." : "Send Link"}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
export default SignIn;
