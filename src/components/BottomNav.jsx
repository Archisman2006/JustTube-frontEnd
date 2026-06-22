import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const BottomNav = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();

    const pathname = location.pathname;
    
    // Active route checking logic
    const isSubscriptionsActive = pathname.startsWith("/subscriptions");
    const isYouActive = pathname.startsWith("/you") || 
                        pathname === "/signin" || 
                        pathname === "/signup" || 
                        (user && pathname.startsWith(`/${user.username}`));
    const isHomeActive = !isSubscriptionsActive && !isYouActive;

    const handleHomeClick = () => {
        navigate("/");
    };

    const handleSubscriptionsClick = () => {
        if (user) {
            navigate("/subscriptions");
        } else {
            navigate("/signin");
        }
    };

    const handleYouClick = () => {
        if (user) {
            navigate("/you/history");
        } else {
            navigate("/signin");
        }
    };

    const getBtnClass = (isActive) => 
        `flex flex-col items-center justify-center flex-1 py-3 text-sm font-semibold transition-colors duration-150 ${
            isActive ? "text-white font-bold bg-zinc-900/40" : "text-zinc-400 hover:text-zinc-200"
        }`;

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/95 border-t border-zinc-800 backdrop-blur-md flex items-center justify-around h-16 px-4">
            <button 
                type="button" 
                onClick={handleHomeClick} 
                className={getBtnClass(isHomeActive)}
            >
                Home
            </button>
            <button 
                type="button" 
                onClick={handleSubscriptionsClick} 
                className={getBtnClass(isSubscriptionsActive)}
            >
                Subscriptions
            </button>
            <button 
                type="button" 
                onClick={handleYouClick} 
                className={getBtnClass(isYouActive)}
            >
                You
            </button>
        </nav>
    );
};

export default BottomNav;
