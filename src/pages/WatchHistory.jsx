import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { EllipsisVertical, Trash2, X, AlertTriangle } from "lucide-react";
import apiClient from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import VideoCard from "../components/VideoCard.jsx";

const WatchHistory = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const sentinelRef = useRef(null);

    // Data State
    const [videos, setVideos] = useState([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [error, setError] = useState("");

    // UI State
    const [menuOpenId, setMenuOpenId] = useState(null); // Tracks which video's menu is open
    const [isClearModalOpen, setIsClearModalOpen] = useState(false);

    // Fetch History
    const fetchHistory = async (pageNumber) => {
        try {
            setLoading(true);
            setError("");
            
            const response = await apiClient.get("/users/history", {
                params: { page: pageNumber, limit: 12 }
            });
            const newVideos = response.data.data.videos.watchHistory;
            const nextPageHasMore = response.data.data.hasNextPage;
            if (pageNumber === 1) {
                setVideos(newVideos);
            } else {
                setVideos((prev) => [...prev, ...newVideos]);
            }
            
            setHasMore(Boolean(nextPageHasMore));
        } catch (err) {
            console.error(err);
            setError("Failed to load watch history.");
            setHasMore(false);
        } finally {
            setLoading(false);
            setInitialLoading(false);
        }
    };

    // Initial Fetch
    useEffect(() => {
        if (!user) {
            navigate("/signin");
            return;
        }
        setVideos([]);
        setPage(1);
        setHasMore(true);
        fetchHistory(1);
    }, [user, navigate]);

    // Infinite Scroll Observer
    useEffect(() => {
        if (!sentinelRef.current || !hasMore || loading) return;
        
        const observer = new IntersectionObserver(
            (entries) => {
                const firstEntry = entries[0];
                if (!firstEntry?.isIntersecting || loading || !hasMore) return;
                setPage((prev) => prev + 1);
            },
            { root: null, rootMargin: "200px", threshold: 0 }
        );
        
        observer.observe(sentinelRef.current);
        return () => observer.disconnect();
    }, [hasMore, loading]);

    // Fetch on page change
    useEffect(() => {
        if (page === 1) return;
        fetchHistory(page);
    }, [page]);

    useEffect(() => {
        if (menuOpenId !== null || isClearModalOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
        }
        return () => { document.body.style.overflow = "auto"; };
    }, [menuOpenId, isClearModalOpen]);

    // Actions
    const handleRemoveVideo = async (videoId) => {
        try {
            await apiClient.delete(`/users/history/${videoId}`);
            setVideos((prev) => prev.filter((v) => v._id !== videoId));
            setMenuOpenId(null);
        } catch (error) {
            console.error("Failed to remove video from history:", error);
            alert("Could not remove video.");
        }
    };

    const handleClearHistory = async () => {
        try {
            await apiClient.delete("/users/history");
            setVideos([]);
            setHasMore(false);
            setIsClearModalOpen(false);
        } catch (error) {
            console.error("Failed to clear watch history:", error);
            alert("Could not clear history.");
        }
    };

    if (initialLoading) return <div className="text-white text-center mt-20 text-xl">Loading history...</div>;

    return (
        <div className="min-h-screen bg-[#0f0f0f] text-white p-4 lg:p-8">
            <div className="max-w-5xl mx-auto">
                
                {/* Header Area */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                    <h1 className="text-3xl font-bold tracking-wide">Watch History</h1>
                    {videos.length > 0 && (
                        <button 
                            onClick={() => setIsClearModalOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 font-semibold text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded-full transition-colors"
                        >
                            <Trash2 size={18} />
                            Clear all watch history
                        </button>
                    )}
                </div>

                {error && <div className="text-red-500 mb-6">{error}</div>}

                {/* Video List */}
                {videos.length === 0 && !error ? (
                    <div className="text-center text-gray-400 mt-20 text-lg">
                        watch history is empty.
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        {videos.map((video) => (
                            <div key={video._id} className="flex items-start gap-3 p-2 rounded-xl hover:bg-zinc-900/50 transition-colors relative">
                                <div className="flex-1 min-w-0">
                                    <VideoCard video={video} />
                                </div>

                                {/* Ellipsis Menu Button */}
                                <div className="relative mt-2 shrink-0">
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setMenuOpenId(video._id);
                                        }}
                                        className="p-2 rounded-full hover:bg-zinc-800 text-gray-400 hover:text-white transition-colors"
                                        aria-label="More options"
                                    >
                                        <EllipsisVertical size={20} />
                                    </button>

                                    {/* Dropdown Menu (Inline positioning) */}
                                    {menuOpenId === video._id && (
                                        <div className="absolute right-0 top-full mt-1
                                        w-56 bg-zinc-900 border border-zinc-700 rounded-lg shadow-2xl z-50 overflow-hidden">
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleRemoveVideo(video._id);
                                                }}
                                                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-zinc-800 transition-colors"
                                            >
                                                <Trash2 size={18} />
                                                <span className="text-sm font-medium">Remove from watch history</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {loading && !initialLoading && (
                    <div className="text-center py-6 text-gray-400 font-medium">
                        Loading older history...
                    </div>
                )}

                {/* Sentinel for Infinite Scroll */}
                <div ref={sentinelRef} className="h-10 w-full mt-4"></div>
            </div>

            {/* --- GLOBAL INVISIBLE OVERLAY FOR CLOSING ELLIPSIS MENU --- */}
            {menuOpenId !== null && (
                <div 
                    className="fixed inset-0 z-40 bg-transparent"
                    onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpenId(null);
                    }}
                />
            )}

            {/* --- CLEAR HISTORY MODAL --- */}
            {isClearModalOpen && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) setIsClearModalOpen(false);
                    }}
                >
                    <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl max-w-sm w-full shadow-2xl">
                        <div className="flex items-center gap-3 text-red-500 mb-4">
                            <AlertTriangle size={24} />
                            <h3 className="text-xl font-bold text-white">Clear history?</h3>
                        </div>
                        <p className="text-gray-400 mb-8 text-sm">
                            Your entire watch history will be cleared. This action cannot be undone.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button 
                                onClick={() => setIsClearModalOpen(false)}
                                className="px-5 py-2 font-semibold hover:bg-zinc-800 rounded-full transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleClearHistory}
                                className="px-5 py-2 font-semibold bg-red-600 hover:bg-red-500 text-white rounded-full transition-colors shadow-[0_0_15px_rgba(220,38,38,0.3)]"
                            >
                                Clear History
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WatchHistory;