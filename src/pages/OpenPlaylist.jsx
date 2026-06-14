import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { X, Trash2 } from "lucide-react";
import apiClient from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import VideoCard from "../components/VideoCard.jsx";

const OpenPlaylist=()=>{
    const { user } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const playlistId = searchParams.get("q");

    const sentinelRef = useRef(null);
    const [playlistInfo, setPlaylistInfo] = useState(null);
    const [videos, setVideos] = useState([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [error, setError] = useState("");

    const [isDescModalOpen, setIsDescModalOpen] = useState(false);

    const fetchPlaylistVideos= async (pageNumber)=>{
        if (!playlistId) return;
        try {
            setLoading(true);
            setError("");
            const response = await apiClient.get(`/playlists/${playlistId}`, {
                params: { page: pageNumber, limit: 12 }
            });
            const { playlist, hasNextPage } = response.data.data;
            if (pageNumber === 1) {
                // Save the overall playlist info (omitting the videos array from state to keep it clean)
                setPlaylistInfo({
                    name: playlist.name,
                    description: playlist.description,
                    visibility: playlist.visibility,
                    owner: playlist.owner,
                    createdAt: playlist.createdAt,
                    totalVideosCount: playlist.totalVideos
                });
                setVideos(playlist.videos || []);
            } else {
                setVideos((prev) => [...prev, ...(playlist.videos || [])]);
            }
            setHasMore(Boolean(hasNextPage));
        } 
        catch (err) {
            console.error(err);
            setError("Failed to load playlist details.");
            setHasMore(false);
        }
        finally{
            setLoading(false);
            setInitialLoading(false);
        }
    }
    useEffect(() => {
        setVideos([]);
        setPage(1);
        setHasMore(true);
        fetchPlaylistVideos(1);
    }, [playlistId]);
    const handleRemoveVideo = async (videoId) => {
        try {
            await apiClient.delete(`/playlists/${playlistId}/${videoId}`);
            // Optimistically update the UI by removing the video
            setVideos((prev) => prev.filter((video) => video._id !== videoId));
            setPlaylistInfo((prev) => ({
                ...prev,
                totalVideos: Math.max(0, (prev.totalVideos || 1) - 1)
            }));
        } catch (error) {
            console.error("Failed to remove video:", error);
            alert("Could not remove video from playlist.");
        }
    };
    useEffect(() => {
        if (isDescModalOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
        }
        return () => { document.body.style.overflow = "auto"; };
    }, [isDescModalOpen]);
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
        fetchPlaylistVideos(page);
    }, [page]);
    if (!playlistId) return <div className="text-white text-center mt-20">No Playlist ID provided.</div>;
    if (initialLoading) return <div className="text-white text-center mt-20 text-xl">Loading playlist...</div>;
    if (error || !playlistInfo) return <div className="text-red-500 text-center mt-20">{error || "Playlist not found."}</div>;
    const thumbnail = videos.length > 0 && videos[0].thumbnail 
        ? videos[0].thumbnail 
        : "https://via.placeholder.com/640x360?text=Empty+Playlist";
    const isOwner = Boolean(user && playlistInfo.owner?._id === user._id);
    const descriptionText = playlistInfo.description || "";
    const isLongDesc = descriptionText.length > 30;
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
                    <h1 className="text-3xl font-bold mb-4 tracking-wide">{playlistInfo.name}</h1>
                    
                    {/* Owner details */}
                    <div 
                        className="flex items-center gap-3 cursor-pointer group mb-4"
                        onClick={() => navigate(`/@${playlistInfo.owner?.userName}/videos`)}
                    >
                        <img 
                            src={playlistInfo.owner?.avatar || "https://via.placeholder.com/48"} 
                            alt={playlistInfo.owner?.userName} 
                            className="w-12 h-12 rounded-full object-cover border border-transparent group-hover:border-red-500 transition-colors"
                        />
                        <div>
                            <p className="font-semibold text-lg group-hover:text-red-400 transition-colors">
                                {playlistInfo.owner?.fullName || playlistInfo.owner?.userName}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-400 font-medium mb-4">
                        <span className="bg-zinc-800 px-3 py-1 rounded-md uppercase text-xs tracking-wider">
                            {playlistInfo.visibility}
                        </span>
                        <span>•</span>
                        <span>{playlistInfo.totalVideos} videos</span>
                    </div>

                    {/* Truncated Description */}
                    <div 
                        className="bg-zinc-900/60 p-4 rounded-xl border border-zinc-800 cursor-pointer hover:bg-zinc-800 transition-colors"
                        onClick={() => setIsDescModalOpen(true)}
                    >
                        <p className="text-sm text-gray-300 break-words">
                            {isLongDesc ? (
                                <>
                                    {descriptionText.substring(0, 30)}... 
                                    <span className="text-white font-bold ml-1 hover:underline">
                                        more
                                    </span>
                                </>
                            ) : (
                                descriptionText
                            )}
                        </p>
                    </div>
                </div>
            </div>

            {/* RIGHT COLUMN - Scrollable Video List */}
            <div className="w-full lg:w-2/3 p-6 lg:h-[calc(100vh-64px)] lg:overflow-y-auto custom-scrollbar bg-[#0f0f0f]">
                {videos.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500">
                        <p className="text-xl font-semibold mb-2">This playlist has no videos</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4 max-w-4xl mx-auto">
                        {videos.map((video, index) => (
                            <div key={`${video._id}-${index}`} className="flex items-start gap-4 p-2 rounded-xl hover:bg-zinc-900/50 transition-colors group">
                                <div className="flex-1 min-w-0">
                                    <VideoCard video={video} width="100%" height="auto" />
                                </div>
                                
                                {/* Remove button (Only for owners) */}
                                {isOwner && (
                                    <button 
                                        onClick={() => handleRemoveVideo(video._id)}
                                        className="p-3 bg-zinc-900 hover:bg-red-900/40 text-gray-400 hover:text-red-500 rounded-full transition-all shrink-0 mt-2 opacity-0 group-hover:opacity-100 focus:opacity-100"
                                        title="Remove from playlist"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                )}
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

            {/* DESCRIPTION MODAL */}
            {isDescModalOpen && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) setIsDescModalOpen(false);
                    }}
                >
                    <div className="bg-zinc-900 border border-zinc-700 w-full max-w-lg rounded-2xl shadow-2xl flex flex-col max-h-[80vh] overflow-hidden">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-5 border-b border-zinc-800">
                            <h3 className="text-xl font-bold">Description</h3>
                            <button 
                                onClick={() => setIsDescModalOpen(false)}
                                className="p-2 hover:bg-zinc-800 rounded-full transition-colors text-gray-400 hover:text-white"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        {/* Modal Scrollable Content */}
                        <div className="p-6 overflow-y-auto custom-scrollbar text-gray-200 whitespace-pre-wrap leading-relaxed">
                            {descriptionText}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
export default OpenPlaylist;