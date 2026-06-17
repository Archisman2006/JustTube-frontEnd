import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { X, Trash2,EllipsisVertical } from "lucide-react";
import apiClient from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import VideoCard from "../components/VideoCard.jsx";

const LikedVideos=()=>{
    const { user } = useAuth();
    const navigate = useNavigate();
    const [totalVideos,setTotalVideos]=useState(0);
    const sentinelRef = useRef(null);
    const [videos, setVideos] = useState([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [error, setError] = useState("");
    const [menuOpenId, setMenuOpenId] = useState(null);

    const fetchLikedVideos= async (pageNumber)=>{
        try {
            setLoading(true);
            setError("");
            const response = await apiClient.get(`/likes/videos`, {
                params: { page: pageNumber, limit: 12 }
            });
            const newVideos = response.data.data.docs;
            const {hasNextPage}=response.data.data;
            setTotalVideos(response.data.data.totalDocs);
            if (pageNumber === 1) {
                setVideos(newVideos || []);
            } else {
                setVideos((prev) => [...prev, ...(newVideos || [])]);
            }
            setHasMore(Boolean(hasNextPage));
        } 
        catch (err) {
            console.error(err);
            setError("Failed to load Liked videos.");
            setHasMore(false);
        }
        finally{
            setLoading(false);
            setInitialLoading(false);
        }
    }
    useEffect(() => {
        if (!user) {
            navigate("/signin");
            return;
        }
        setVideos([]);
        setPage(1);
        setHasMore(true);
        fetchLikedVideos(1);
    }, [user,navigate]);
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
    useEffect(() => {
        if (page === 1) return;
        fetchLikedVideos(page);
    }, [page]);
    useEffect(() => {
            if (menuOpenId !== null) {
                document.body.style.overflow = "hidden";
            } else {
                document.body.style.overflow = "auto";
            }
            return () => { document.body.style.overflow = "auto"; };
        }, [menuOpenId]);
    const handleRemoveVideo = async (videoId) => {
        try {
            await apiClient.post(`/likes/videos/${videoId}`);
            setVideos((prev) => prev.filter((v) => v._id !== videoId));
            setMenuOpenId(null);
        } catch (error) {
            console.error("Failed to remove video from Liked Videos:", error); 
            alert("Could not remove video.");
        }
    };
    if (initialLoading) return <div className="text-white text-center mt-20 text-xl">Loading Videos...</div>;
    if (error) return <div className="text-red-500 text-center mt-20">{error || "videos not found."}</div>;
    const thumbnail = videos.length > 0 && videos?.[0]?.video?.thumbnail 
        ? videos[0].video.thumbnail 
        : "/src/assets/images.png";
    return (
        <div className="min-h-[calc(100vh-64px)] bg-[#0f0f0f] text-white flex flex-col lg:flex-row overflow-hidden">
            {/* LEFT COLUMN - Fixed Content */}
            <div className="w-full lg:w-1/3 p-6 lg:border-r border-zinc-800 flex flex-col gap-6 lg:h-[calc(100vh-64px)] lg:sticky lg:top-0 lg:overflow-y-auto custom-scrollbar">
                
                {/* Playlist Thumbnail */}
                <div className="w-full aspect-video rounded-xl overflow-hidden shadow-xl bg-zinc-800">
                    <img 
                        src={thumbnail} 
                        alt="Playlist Thumbnail" 
                        className="w-full h-full object-cover backdrop-blur-sm"
                    />
                </div>
                {/* Playlist Info */}
                <div>
                    <h1 className="text-3xl font-bold mb-4 tracking-wide">Liked Videos</h1>
                    
                    {/* Owner details */}
                    <div 
                        className="flex items-center gap-3 cursor-pointer group mb-4"
                        onClick={() => navigate(`/${user.username}/videos`)}
                    >
                        <img 
                            src={user?.avatar || "/src/assets/images.png"} 
                            alt={user?.userName} 
                            className="w-12 h-12 rounded-full object-cover border border-transparent group-hover:border-red-500 transition-colors"
                        />
                        <div>
                            <p className="font-semibold text-lg group-hover:text-red-400 transition-colors">
                                {user?.fullName}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-400 font-medium mb-4">
                        <span>{totalVideos} videos</span>
                    </div>
                </div>
            </div>

            {/* RIGHT COLUMN - Scrollable Video List */}
            <div className="w-full lg:w-2/3 p-6 lg:h-[calc(100vh-64px)] lg:overflow-y-auto custom-scrollbar bg-[#0f0f0f]">
                {videos.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500">
                        <p className="text-xl font-semibold mb-2">No Liked Videos</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4 max-w-4xl mx-auto">
                        {videos.map((video, index) => (
                            <div key={`${video._id}-${index}`} className="flex items-start gap-4 p-2 rounded-xl hover:bg-zinc-900/50 transition-colors group">
                                <div className="flex-1 min-w-0">
                                    <VideoCard video={video?.video} width="65%" height="auto" />
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
                                                <span className="text-sm font-medium">Remove from Liked Videos</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                
                {loading && !initialLoading && (
                    <div className="text-center py-4 text-gray-400 font-semibold">
                        Loading more videos...
                    </div>
                )}
                
                {/* Intersection Observer Target */}
                <div ref={sentinelRef} className="h-10 w-full"></div>
            </div>
            {menuOpenId !== null && (
                <div 
                    className="fixed inset-0 z-40 bg-transparent"
                    onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpenId(null);
                    }}
                />
            )}
        </div>
    )
}
export default LikedVideos;