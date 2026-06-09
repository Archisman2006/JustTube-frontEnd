import React, { useEffect, useRef, useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ThumbsUp,Bookmark,Plus,X,EllipsisVertical } from "lucide-react";
import apiClient from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import PlaylistCard from '../components/PlaylistCard.jsx'
// Components
import VideoPlayer from "../components/VideoPlayer.jsx";
import ChannelCard from "../components/ChannelCard.jsx";
import VideoComments from "../components/VideoComments.jsx";
import RecommendedVideos from "../components/RecommendedVideos.jsx";
const pluralize = (value, unit) => `${value} ${unit}${value === 1 ? "" : "s"} ago`;
const formatRelativeTime = (createdAt) => {
    const createdDate = new Date(createdAt);
    if (Number.isNaN(createdDate.getTime())) return "";
    const diffMs = Math.max(0, Date.now() - createdDate.getTime());
    const seconds = Math.floor(diffMs / 1000);
    if (seconds < 60) return pluralize(seconds, "second");
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return pluralize(minutes, "minute");
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return pluralize(hours, "hour");
    const days = Math.floor(hours / 24);
    if (days < 30) return pluralize(days, "day");
    const months = Math.floor(days / 30);
    if (months < 12) return pluralize(months, "month");
    const years = Math.floor(months / 12);
    return pluralize(years, "year");
};

const WatchVideo=()=>{
    const { user } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const videoId = searchParams.get('q');
    const playerRef = useRef(null);

    const [video, setVideo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isVideoLiked, setIsVideoLiked] = useState(false);
    const [videoLikesCount, setVideoLikesCount] = useState(0);
    const [isDescExpanded, setIsDescExpanded] = useState(false);
    const [commentText, setCommentText] = useState("");
    const [isCommentFocused, setIsCommentFocused] = useState(false);
    const [commentsRefreshKey, setCommentsRefreshKey] = useState(0);
    const [unAuthModalOpen, setUnAuthModalOpen] = useState(false);
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, commentId: null });
    const [isVideoActionsOpen, setIsVideoActionsOpen] = useState(false);
    const [deleteVideoModal, setDeleteVideoModal] = useState({ isOpen: false, isConfirmed: false });

    const [isSaveMenuOpen, setIsSaveMenuOpen] = useState(false);
    const [isCreatePlaylistOpen, setIsCreatePlaylistOpen] = useState(false);
    const [playlists, setPlaylists] = useState([]);
    const [loadingPlaylists, setLoadingPlaylists] = useState(false);
    const [newPlaylist, setNewPlaylist] = useState({ name: '', description: '', visibility: 'public' });
const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });
    useEffect(() => {
        if (unAuthModalOpen || deleteModal.isOpen || deleteVideoModal.isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
        }
        return () => { document.body.style.overflow = "auto"; };
    }, [unAuthModalOpen, deleteModal.isOpen, deleteVideoModal.isOpen, isSaveMenuOpen, isCreatePlaylistOpen]);
    // --- VideoPlayer Options ---
    const videoJsOptions = useMemo(() => {
        if (!video) return {};
        const src = video.streamingUrl || video.videoFile;
        const type = video.streamingUrl ? 'application/x-mpegURL' : 'video/mp4';
        return {
            autoplay: true,
            controls: true,
            fluid: true,
            sources: [{ src, type }]
        };
    }, [video]);
    useEffect(() => {
        if (!videoId) return;
        const fetchVideo = async () => {
            try {
                setLoading(true);
                // Standard REST for fetching a single item is usually GET
                const response = await apiClient.get(`/videos/${videoId}`);
                const videoData = response.data.data;
                setVideo(videoData);
                
                // Initialize likes
                setIsVideoLiked(videoData.isLikedByMe || false);
                setVideoLikesCount(videoData.likesCount || 0);
            } catch (error) {
                console.error('Could not retrieve video:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchVideo();
    }, [videoId]);
    const handlePlayerReady = (player) => {
        playerRef.current = player;
    };
    const handleLike = async () => {
        if (!user) {
            setUnAuthModalOpen(true);
            return;
        }
        try {
            const response = await apiClient.post(`/likes/videos/${videoId}`);
            const isNowLiked = response.data && Object.keys(response.data).length > 0;
            setIsVideoLiked(isNowLiked);
            setVideoLikesCount(prev => isNowLiked ? prev + 1 : prev - 1);
        } catch (error) {
            console.error("Failed to toggle like on video");
        }
    };
    const handlePostComment = async () => {
        if (!commentText.trim()) return;
        try {
            await apiClient.post(`/comments/${videoId}`, { content: commentText });
            setCommentText("");
            setIsCommentFocused(false);
            // Incrementing this key forces the <VideoComments> component below to re-mount and fetch the latest comments
            setCommentsRefreshKey(prev => prev + 1); 
        } catch (error) {
            console.error("Failed to post comment");
        }
    };
    const triggerToast = (message, type = 'success') => {
        setToast({ visible: true, message, type });
        setTimeout(() => setToast({ visible: false, message: '', type: 'success' }), 3000);
    };
    const handleSaveButtonClick = async () => {
        if (!user) {
            setUnAuthModalOpen(true);
            return;
        }
        setIsSaveMenuOpen(true);
        setLoadingPlaylists(true);
        try {
            const response = await apiClient.get('/playlists', { params: { userId: user._id } });
            setPlaylists(response.data.data || []); 
        } catch (error) {
            console.error("Failed to fetch playlists");
        } finally {
            setLoadingPlaylists(false);
        }
    };
    const handleAddToPlaylist = async (playlistId) => {
        setIsSaveMenuOpen(false);
        try {
            await apiClient.post(`/playlists/${playlistId}/${videoId}`);
            triggerToast("Video added to playlist successfully!", "success");
        } catch (error) {
            triggerToast(error?.response?.data?.message || "Failed to add video to playlist", "error");
        }
    };

    const handleDeleteCommentConfirm = async () => {
        if (!deleteModal.commentId) return;
        try {
            await apiClient.delete(`/comments/videos/${deleteModal.commentId}`);
            setDeleteModal({ isOpen: false, commentId: null });
            setCommentsRefreshKey(prev => prev + 1);
        } catch (error) {
            console.error("Failed to delete comment");
        }
    };
    const handleEditVideo = () => {
        setIsVideoActionsOpen(false);
        navigate(`/edit/video?q=${videoId}`);
    };
    const handleDeleteVideo = async () => {
        if (!deleteVideoModal.isConfirmed) return;
        try {
            await apiClient.delete(`/videos/${videoId}`);
            setDeleteVideoModal({ isOpen: false, isConfirmed: false });
            setIsVideoActionsOpen(false);
            navigate("/");
        } catch (error) {
            console.error("Failed to delete video");
        }
    };
    const handleBackdropClick = (e, closeFunction) => {
        if (e.target === e.currentTarget) closeFunction();
    };
    const handleCreatePlaylist = async () => {
        if (!newPlaylist.name.trim()) return;
        try {
            const response = await apiClient.post('/playlists',{...newPlaylist,videoId});
            const createdPlaylistId = response.data.data._id; 
            
            setIsCreatePlaylistOpen(false);
            setNewPlaylist({ name: '', description: '', visibility: 'public' });
        } catch (error) {
            triggerToast(error?.response?.data?.message || "Failed to create playlist", "error");
        }
    };
    if (loading) return <div className="text-white text-center mt-20 text-xl">Loading...</div>;
    if (!video) return <div className="text-white text-center mt-20 text-xl">Video not found.</div>;
    const createdAgo = formatRelativeTime(video.createdAt);
    const description = video.description || "";
    const isLongDescription = description.length > 50;
    const displayDescription = isDescExpanded || !isLongDescription 
        ? description 
        : `${description.slice(0, 50)}...`;
    const isVideoOwner = Boolean(user  && video.owner._id=== user._id);
    return (
        <div className="min-h-screen bg-[#0f0f0f] text-white p-4">
            {/* Main Layout: Flex for Left Content, Sidebar for Right */}
            <div className="flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto">
                {/* LEFT COLUMN: Video, Info, Comments */}
                <div className="flex-1 lg:w-2/3">
                    
                    {/* 1. Video Player */}
                    <div className="mb-4">
                        <VideoPlayer options={videoJsOptions} onReady={handlePlayerReady} />
                    </div>

                    {/* 2. Title */}
                    <h1 className="text-2xl font-bold mb-4">{video.title}</h1>

                    {/* 3. Channel Card & Like Button Row */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                        <div className="w-full sm:w-auto">
                            <ChannelCard channel={video.owner} />
                        </div>
                        <div className="flex items-center">
                            <button 
                                onClick={handleLike}
                                className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-full transition"
                            >
                                <ThumbsUp 
                                    size={20} 
                                    fill={isVideoLiked ? "white" : "none"} 
                                    className={isVideoLiked ? "text-white" : "text-gray-300"}
                                />
                                <span>{videoLikesCount}</span>
                            </button>
                        </div>
                        <div>
                            <button 
                                onClick={handleSaveButtonClick}  className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-full transition ml-3">
                                <Bookmark size={20} className="text-gray-300" />
                                <span>Save</span>
                            </button>
                        </div>
                        {isVideoOwner && (
                            <div className="relative ml-2">
                                <button
                                    type="button"
                                    onClick={() => setIsVideoActionsOpen((value) => !value)}
                                    className="flex items-center justify-center w-10 h-10 bg-zinc-800 hover:bg-zinc-700 rounded-full transition"
                                    aria-label="Video actions"
                                >
                                    <EllipsisVertical size={18} className="text-gray-300" />
                                </button>
                                {isVideoActionsOpen && (
                                    <div className="absolute right-0 top-full mt-2 w-44 rounded-xl border border-zinc-700 bg-zinc-900 shadow-2xl overflow-hidden z-20">
                                        <button
                                            type="button"
                                            onClick={handleEditVideo}
                                            className="w-full px-4 py-3 text-left text-sm font-semibold hover:bg-zinc-800 transition"
                                        >
                                            Edit video
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIsVideoActionsOpen(false);
                                                setDeleteVideoModal({ isOpen: true, isConfirmed: false });
                                            }}
                                            className="w-full px-4 py-3 text-left text-sm font-semibold hover:bg-zinc-800 transition text-red-400"
                                        >
                                            Delete video
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* 4. Expandable Description Section */}
                    <div 
                        className={`bg-zinc-900 rounded-xl p-4 mb-8 transition-colors ${!isDescExpanded ? "hover:bg-zinc-800 cursor-pointer" : ""}`}
                        onClick={() => { if (!isDescExpanded) setIsDescExpanded(true) }}
                    >
                        <p className="font-bold text-sm mb-1 text-gray-300">
                            {video.views} views • {createdAgo}
                        </p>
                        <p className="whitespace-pre-wrap text-sm text-gray-100">
                            {displayDescription}
                        </p>
                        {isDescExpanded && isLongDescription && (
                            <button 
                                className="mt-4 font-bold text-sm text-gray-400 hover:text-white"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsDescExpanded(false);
                                }}
                            >
                                Show less
                            </button>
                        )}
                    </div>

                    {/* 5. Add Comment Section */}
                    <div className="mb-8">
                        <h2 className="text-xl font-bold mb-4">
                            {video.commentsCount || 0} Comments
                        </h2>
                        
                        <div className="flex gap-4">
                            <img 
                                src={user?.avatar || "https://via.placeholder.com/48"} 
                                alt="Your avatar" 
                                className="w-10 h-10 rounded-full object-cover"
                            />
                            <div className="flex-1">
                                <input 
                                    type="text"
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                    onFocus={() => setIsCommentFocused(true)}
                                    placeholder="Add a comment..."
                                    className="w-full bg-transparent border-b border-gray-600 focus:border-white focus:outline-none py-1 transition-colors"
                                />
                                {isCommentFocused && (
                                    <div className="flex justify-end gap-2 mt-3">
                                        <button 
                                            onClick={() => {
                                                setIsCommentFocused(false);
                                                setCommentText("");
                                            }}
                                            className="px-4 py-2 text-sm font-semibold hover:bg-zinc-800 rounded-full"
                                        >
                                            Cancel
                                        </button>
                                        <button 
                                            onClick={handlePostComment}
                                            disabled={!commentText.trim()}
                                            className="px-4 py-2 text-sm font-semibold bg-red-600 text-white rounded-full disabled:opacity-50 disabled:bg-zinc-700"
                                        >
                                            Comment
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* 6. Comments List Component */}
                    <VideoComments 
                        key={commentsRefreshKey} // Forces remount/refetch when a new comment is added or deleted
                        onDeleteRequest={(id) => setDeleteModal({ isOpen: true, commentId: id })}
                        onUnAuthAction={() => setUnAuthModalOpen(true)}
                    />
                </div>

                {/* RIGHT COLUMN: Explore / Recommended */}
                <div className="lg:w-1/3">
                    <h2 className="text-xl font-bold mb-4">Explore</h2>
                    <RecommendedVideos />
                </div>
            </div>

    {/* --- MODALS (Using Fixed Portals) --- */}

    {/* UnAuthenticated Action Modal */}
    {unAuthModalOpen && (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
            onClick={(e) => handleBackdropClick(e, () => setUnAuthModalOpen(false))}
        >
            <div className="bg-zinc-900 border border-zinc-700 p-6 rounded-xl max-w-sm w-full shadow-2xl mx-4">
                <h3 className="text-xl font-bold mb-2">Sign in to continue</h3>
                <p className="text-gray-400 mb-6">You need to be signed in to perform this action.</p>
                <div className="flex justify-end gap-4">
                    <button 
                        onClick={() => setUnAuthModalOpen(false)}
                        className="px-4 py-2 font-semibold hover:bg-zinc-800 rounded"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={() => navigate('/signin')}
                        className="px-4 py-2 font-semibold bg-red-600 hover:bg-red-500 rounded text-white"
                    >
                        Sign In
                    </button>
                </div>
            </div>
        </div>
    )}

    {/* Delete Comment Confirmation Modal */}
    {deleteModal.isOpen && (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
            onClick={(e) => handleBackdropClick(e, () => setDeleteModal({ isOpen: false, commentId: null }))}
        >
            <div className="bg-zinc-900 border border-zinc-700 p-6 rounded-xl max-w-sm w-full shadow-2xl mx-4">
                <h3 className="text-xl font-bold mb-2">Delete comment</h3>
                <p className="text-gray-400 mb-6">Delete your comment permanently?</p>
                <div className="flex justify-end gap-4">
                    <button 
                        onClick={() => setDeleteModal({ isOpen: false, commentId: null })}
                        className="px-4 py-2 font-semibold hover:bg-zinc-800 rounded"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleDeleteCommentConfirm}
                        className="px-4 py-2 font-semibold bg-red-600 hover:bg-red-500 rounded text-white"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    )}
    {/* Delete Video Confirmation Modal */}
    {deleteVideoModal.isOpen && (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
            onClick={(e) => handleBackdropClick(e, () => setDeleteVideoModal({ isOpen: false, isConfirmed: false }))}
        >
            <div className="bg-zinc-900 border border-zinc-700 p-6 rounded-xl max-w-sm w-full shadow-2xl mx-4">
                <h3 className="text-xl font-bold mb-2">Permanently delete the video?</h3>
                <label className="flex items-start gap-3 mb-6 text-sm text-gray-300 cursor-pointer select-none">
                    <input
                        type="checkbox"
                        checked={deleteVideoModal.isConfirmed}
                        onChange={(e) => setDeleteVideoModal((prev) => ({ ...prev, isConfirmed: e.target.checked }))}
                        className="mt-1 h-4 w-4 rounded border-zinc-600 bg-zinc-800 text-red-600 focus:ring-red-600"
                    />
                    <span>I understand that deleting this video is permanent.</span>
                </label>
                <div className="flex justify-end gap-4">
                    <button
                        onClick={() => setDeleteVideoModal({ isOpen: false, isConfirmed: false })}
                        className="px-4 py-2 font-semibold hover:bg-zinc-800 rounded"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleDeleteVideo}
                        disabled={!deleteVideoModal.isConfirmed}
                        className="px-4 py-2 font-semibold bg-red-600 hover:bg-red-500 rounded text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    )}
    {/* Save to Playlist Modal */}
    {isSaveMenuOpen && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
        onClick={(e) => handleBackdropClick(e, () => setIsSaveMenuOpen(false))}>
        <div className="bg-zinc-900 border border-zinc-700 p-6 rounded-xl max-w-sm w-full shadow-2xl mx-4 flex flex-col max-h-[70vh]">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Save to playlist</h3>
                <button onClick={() => setIsSaveMenuOpen(false)}>
                    <X size={20} className="text-gray-400 hover:text-white" />
                </button>
            </div>
            
            {/* Scrollable list of playlists */}
            <div className="overflow-y-auto flex-1 mb-4 pr-2">
                {loadingPlaylists ? (
                    <p className="text-gray-400">Loading playlists...</p>
                ) : playlists.length > 0 ? (
                    <div className="flex flex-col gap-2">
                        {playlists.map(pl => (
                            <div onClick={handleAddToPlaylist} key={pl._id}>
                                <PlaylistCard playlist={pl}/>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-400">No playlists found.</p>
                )}
            </div>
            <button 
                onClick={() => {
                    setIsSaveMenuOpen(false);
                    setIsCreatePlaylistOpen(true);
                }}
                className="flex items-center justify-center gap-2 px-4 py-3 font-semibold hover:bg-zinc-800 rounded border border-zinc-700 mt-2"
            >
                <Plus size={18} /> Create new playlist
            </button>
        </div>
    </div>
    )}
    {/* Create New Playlist Modal */}
    {isCreatePlaylistOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
            onClick={(e) => handleBackdropClick(e, () => setIsCreatePlaylistOpen(false))}
        >
            <div className="bg-zinc-900 border border-zinc-700 p-6 rounded-xl max-w-sm w-full shadow-2xl mx-4">
                <h3 className="text-xl font-bold mb-4">
                    Create new playlist
                </h3>
                <div className="flex flex-col gap-5 mb-6">
                    <div>
                        <label className="block text-sm font-semibold mb-1 text-gray-300">
                            Title
                        </label>
                        <input 
                            type="text" 
                            value={newPlaylist.name}
                            onChange={(e) => setNewPlaylist({...newPlaylist, name: e.target.value})}
                            className="w-full bg-transparent border-b border-gray-600 focus:border-white focus:outline-none py-1 transition-colors"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-1 text-gray-300">Description</label>
                        <input 
                            type="text" 
                            value={newPlaylist.description}
                            onChange={(e) => setNewPlaylist({...newPlaylist, description: e.target.value})}
                            className="w-full bg-transparent border-b border-gray-600 focus:border-white focus:outline-none py-1 transition-colors"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-1 text-gray-300">Visibility</label>
                        <select 
                            value={newPlaylist.visibility}
                            onChange={(e) => setNewPlaylist({...newPlaylist, visibility: e.target.value})}
                            className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-2 focus:outline-none text-white"
                        >
                            <option value="public">Public</option>
                            <option value="private">Private</option>
                        </select>
                    </div>
                </div>

                <div className="flex justify-end gap-4">
                    <button 
                        onClick={() => setIsCreatePlaylistOpen(false)}
                        className="px-4 py-2 font-semibold hover:bg-zinc-800 rounded"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleCreatePlaylist}
                        disabled={!newPlaylist.name.trim()}
                        className="px-4 py-2 font-semibold bg-white text-black hover:bg-gray-200 rounded disabled:opacity-50 disabled:bg-gray-500"
                    >
                        Create
                    </button>
                </div>
            </div>
        </div>
    )}
    {toast.visible && (
        <div className={`fixed bottom-5 left-5 z-50 px-6 py-3 rounded shadow-lg transition-opacity ${toast.type === 'error' ? 'bg-red-600' : 'bg-green-600'} text-white font-medium`}>
            {toast.message}
        </div>
    )}
        </div>
    )
}
export default WatchVideo;