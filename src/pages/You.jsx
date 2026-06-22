import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import apiClient from "../services/api.js";
import VideoCard from "../components/VideoCard.jsx";
import avatarPlaceholder from "../assets/user.png";

const You = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    // Data States
    const [historyVideos, setHistoryVideos] = useState([]);
    const [likedVideos, setLikedVideos] = useState([]);
    const [yourVideos, setYourVideos] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Refs for scrolling carousels
    const historyScrollRef = useRef(null);
    const likedScrollRef = useRef(null);
    const yourScrollRef = useRef(null);

    // Initial Load & Auth Redirect
    useEffect(() => {
        if (!user) {
            navigate("/signin");
            return;
        }

        const fetchAllData = async () => {
            try {
                setLoading(true);
                setError("");

                // 1. Fetch History (Up to 12 items)
                const historyRes = await apiClient.get("/users/history", {
                    params: { page: 1, limit: 12 }
                });
                const rawHistory = historyRes.data.data.videos.watchHistory || [];
                setHistoryVideos(rawHistory.slice(0, 12));

                // 2. Fetch Liked Videos (Up to 12 items)
                const likedRes = await apiClient.get("/likes/videos", {
                    params: { page: 1, limit: 12 }
                });
                const rawLiked = likedRes.data.data.docs || [];
                setLikedVideos(rawLiked.slice(0, 12));

                // 3. Fetch User's Uploaded Videos (Up to 12 items)
                const yourRes = await apiClient.get(`/dashboard/videos/${user.username}`, {
                    params: { page: 1, limit: 12 }
                });
                const rawYour = yourRes.data.data.docs || [];
                setYourVideos(rawYour.slice(0, 12));

            } catch (err) {
                console.error("Failed to load You page data:", err);
                setError("Failed to load page content.");
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();
    }, [user, navigate]);

    const handleScroll = (ref, direction) => {
        if (ref.current) {
            const { scrollLeft, clientWidth } = ref.current;
            const scrollAmount = clientWidth * 0.8;
            ref.current.scrollTo({
                left: direction === "left" ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
                behavior: "smooth"
            });
        }
    };

    const handleProfileClick = () => {
        if (user) {
            navigate(`/${user.username}/videos`);
        }
    };

    if (loading) {
        return <div className="text-white text-center mt-20 text-xl font-medium">Loading page details...</div>;
    }

    if (error) {
        return <div className="text-red-500 text-center mt-20 font-medium">{error}</div>;
    }

    const renderCarousel = (videos, title, listType, scrollRef, onHeaderClick) => {
        return (
            <section className="mb-12 relative">
                {/* Carousel Header */}
                <h2 
                    onClick={onHeaderClick}
                    className="text-xl md:text-2xl font-bold text-white hover:text-rose-500 hover:underline cursor-pointer transition mb-4 w-fit flex items-baseline gap-2"
                >
                    {title}
                    <span className="text-zinc-500 text-xs font-normal tracking-wide">(see all)</span>
                </h2>

                {videos.length === 0 ? (
                    <div className="bg-zinc-900/30 border border-zinc-800/80 rounded-xl p-8 text-center text-zinc-500 text-sm">
                        No videos found in {title.toLowerCase()}.
                    </div>
                ) : (
                    <div className="relative flex items-center group">
                        {/* Left Scroll Button (Desktop Only) */}
                        <button 
                            type="button"
                            onClick={() => handleScroll(scrollRef, "left")}
                            className="hidden md:flex absolute -left-5 z-10 items-center justify-center w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-white shadow-lg active:scale-95 transition-all hover:scale-105"
                            aria-label="Scroll left"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        
                        {/* Scroll Container */}
                        <div 
                            ref={scrollRef}
                            className="flex-1 flex gap-4 overflow-x-auto scrollbar-none scroll-smooth py-2 px-1"
                        >
                            {videos.map((item, idx) => {
                                // Liked videos list response nests the video details inside video property
                                const videoData = listType === "liked" ? item.video : item;
                                if (!videoData) return null;
                                return (
                                    <div key={`${videoData._id}-${idx}`} className="w-55 sm:w-65 md:w-70 shrink-0">
                                        <VideoCard video={videoData} width="100%" height="auto" />
                                    </div>
                                );
                            })}
                        </div>

                        {/* Right Scroll Button (Desktop Only) */}
                        <button 
                            type="button"
                            onClick={() => handleScroll(scrollRef, "right")}
                            className="hidden md:flex absolute -right-5 z-10 items-center justify-center w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-white shadow-lg active:scale-95 transition-all hover:scale-105"
                            aria-label="Scroll right"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                )}
            </section>
        );
    };

    return (
        <div className="min-h-screen bg-[#0f0f0f] text-white p-4 md:p-8 max-w-7xl mx-auto">
            {/* Top User Profile Div */}
            <div 
                onClick={handleProfileClick}
                className="flex items-center gap-4 md:gap-6 p-4 hover:bg-zinc-900/50 border border-transparent hover:border-zinc-800/60 rounded-2xl cursor-pointer transition w-fit mb-10 group"
            >
                {/* Avatar */}
                <div className="flex items-center justify-center h-20 w-20 md:h-24 md:w-24 rounded-full bg-zinc-800 text-zinc-300 ring-4 ring-zinc-700/80 overflow-hidden shrink-0 group-hover:ring-rose-500 transition-all duration-300">
                    {user?.avatar ? (
                        <img 
                            src={user.avatar} 
                            alt={user.username} 
                            className="h-full w-full object-cover" 
                        />
                    ) : (
                        <span className="text-2xl font-bold uppercase select-none">
                            {user?.username?.charAt(0)}
                        </span>
                    )}
                </div>

                {/* Name / Info */}
                <div className="flex flex-col">
                    <h1 className="text-2xl md:text-3xl font-extrabold text-white group-hover:text-rose-400 transition-colors">
                        {user?.fullName || "User Name"}
                    </h1>
                    <p className="text-zinc-400 text-sm md:text-base tracking-wide mt-1">
                        @{user?.username}
                    </p>
                </div>
            </div>

            {/* History Carousel */}
            {renderCarousel(
                historyVideos,
                "History",
                "history",
                historyScrollRef,
                () => navigate("/you/history")
            )}

            {/* Liked Videos Carousel */}
            {renderCarousel(
                likedVideos,
                "Liked Videos",
                "liked",
                likedScrollRef,
                () => navigate("/you/liked-videos")
            )}

            {/* Your Videos Carousel */}
            {renderCarousel(
                yourVideos,
                "Your Videos",
                "your",
                yourScrollRef,
                () => navigate(`/${user?.username}/videos`)
            )}
        </div>
    );
};

export default You;
