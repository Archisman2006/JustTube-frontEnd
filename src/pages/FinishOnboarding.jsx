import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import apiClient from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { Loader2, CheckCircle2, XCircle, ArrowRight } from "lucide-react";

const FinishOnboarding = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { login } = useAuth();
    
    // Retrieve tempToken from navigation state
    const tempToken = location.state?.tempToken;
    
    const [username, setUsername] = useState("");
    const [isChecking, setIsChecking] = useState(false);
    const [isAvailable, setIsAvailable] = useState(null);
    const [checkingError, setCheckingError] = useState("");
    const [submitError, setSubmitError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Regex to match valid username (e.g. lowercase letters, numbers, underscores, 3-20 chars)
    const usernameRegex = /^[a-z0-9_]{3,20}$/;

    useEffect(() => {
        if (!tempToken) {
            return;
        }

        if (!username) {
            setIsAvailable(null);
            setCheckingError("");
            return;
        }

        if (!usernameRegex.test(username)) {
            setIsAvailable(false);
            setCheckingError("Username must be 3-20 characters long and contain only lowercase letters, numbers, and underscores.");
            return;
        }

        setCheckingError("");
        setIsChecking(true);
        setIsAvailable(null);

        const delayDebounce = setTimeout(async () => {
            try {
                const response = await apiClient.get(`/users/check-username/${username}`);
                if (response.data && response.data.success) {
                    setIsAvailable(response.data.data.available);
                    if (!response.data.data.available) {
                        setCheckingError("Username is already taken.");
                    }
                }
            } catch (err) {
                console.error("Error checking username availability:", err);
                if (err.response?.status === 409 || err.response?.data?.message?.includes("taken")) {
                    setIsAvailable(false);
                    setCheckingError("Username is already taken.");
                } else {
                    setCheckingError("Failed to verify username availability. Please try again.");
                    setIsAvailable(null);
                }
            } finally {
                setIsChecking(false);
            }
        }, 500);

        return () => clearTimeout(delayDebounce);
    }, [username, tempToken]);

    if (!tempToken) {
        return (
            <div className="flex flex-1 items-center justify-center p-4 min-h-[65vh]">
                <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900/60 p-8 shadow-xl shadow-black/30 backdrop-blur-sm text-center">
                    <h2 className="mb-4 text-2xl font-bold tracking-tight text-white">
                        Session Expired
                    </h2>
                    <p className="text-zinc-400 mb-6">
                        No temporary Google session found. Please try logging in again.
                    </p>
                    <button
                        onClick={() => navigate("/signin")}
                        className="w-full rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-zinc-950 hover:bg-zinc-200 transition duration-200"
                    >
                        Go to Sign In
                    </button>
                </div>
            </div>
        );
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isAvailable || isChecking || isSubmitting) return;

        setIsSubmitting(true);
        setSubmitError("");

        try {
            const response = await apiClient.post("/users/google-register", {
                username,
                tempToken,
            });

            if (response.data && response.data.success) {
                login(response.data.data.user, response.data.data.accessToken);
                navigate("/");
            }
        } catch (err) {
            console.error("Error completing Google registration:", err);
            setSubmitError(
                err.response?.data?.message ||
                "An error occurred while completing registration. Please try again."
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex flex-1 items-center justify-center p-4 min-h-[65vh]">
            <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900/60 p-8 shadow-xl shadow-black/30 backdrop-blur-sm">
                <h2 className="mb-2 text-center text-2xl font-bold tracking-tight text-white">
                    Choose a Username
                </h2>
                <p className="mb-6 text-center text-sm text-zinc-400">
                    To complete your registration, please pick a unique username.
                </p>

                {submitError && (
                    <div className="mb-6 rounded-lg border border-red-500/30 bg-red-950/40 px-4 py-3 text-sm text-red-300">
                        {submitError}
                    </div>
                )}

                <form onSubmit={handleSubmit} noValidate>
                    <div className="relative mb-4">
                        <label className="mb-1.5 block text-sm font-medium text-zinc-300">
                            Username
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, ""))}
                                className={`w-full rounded-lg border bg-zinc-900 px-4 py-2.5 text-white placeholder:text-zinc-500 focus:outline-none transition-colors ${
                                    isAvailable === true
                                        ? "border-emerald-500 focus:border-emerald-500"
                                        : isAvailable === false
                                        ? "border-rose-500 focus:border-rose-500"
                                        : "border-zinc-700 focus:border-zinc-500"
                                }`}
                                placeholder="pick_a_username"
                                disabled={isSubmitting}
                                autoFocus
                            />
                            <div className="absolute inset-y-0 right-3 flex items-center">
                                {isChecking && (
                                    <Loader2 className="h-5 w-5 animate-spin text-zinc-400" />
                                )}
                                {!isChecking && isAvailable === true && (
                                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                )}
                                {!isChecking && isAvailable === false && (
                                    <XCircle className="h-5 w-5 text-rose-500" />
                                )}
                            </div>
                        </div>
                        
                        {checkingError && (
                            <p className="mt-1.5 text-xs text-rose-400">
                                {checkingError}
                            </p>
                        )}
                        {!checkingError && isAvailable === true && (
                            <p className="mt-1.5 text-xs text-emerald-400">
                                Username is available!
                            </p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={!isAvailable || isChecking || isSubmitting}
                        className={`w-full flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-all duration-200 ${
                            isAvailable && !isChecking && !isSubmitting
                                ? "bg-white text-zinc-950 hover:bg-zinc-200 cursor-pointer"
                                : "cursor-not-allowed bg-zinc-800 text-zinc-500"
                        }`}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin text-zinc-950" />
                                Completing registration...
                            </>
                        ) : (
                            <>
                                Finish Registration
                                <ArrowRight className="h-4 w-4" />
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default FinishOnboarding;
