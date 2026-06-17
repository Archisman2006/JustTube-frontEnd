import React,{use, useEffect,useState} from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import apiClient from "../services/api.js";

const Dashboard=({channel})=>{
    const navigate=useNavigate();
    const {user}=useAuth();
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [subscriberCount,setSubscriberCount]=useState(0);
    const [totalVideos,setTotalVideos]=useState(0);
    const [totalViews,setTotalViews]=useState(0);
    const [totalLikes,setTotalLikes]=useState(0);
    const [loading,setLoading]=useState(false);
    const [isEditCoverImageModalOpen,setIsEditCoverImageModalOpen]=useState(false);
    const [isEditAvatarModalOpen,setIsEditAvatarModalOpen]=useState(false);
    const [avatarFile, setAvatarFile] = useState(null);
    const [coverImageFile, setCoverImageFile] = useState(null);
    const [avatarError, setAvatarError] = useState("");
    const [coverImageError, setCoverImageError] = useState("");
    const fetchStats=async ()=>{
        if(!channel?._id){
            return;
        }
        try {
            setLoading(true);
            const response=await apiClient.get(`/dashboard/${channel._id}`);
            const responseData=response.data.data;
            setSubscriberCount(responseData.totalSubscribers);
            setTotalVideos(responseData.totalVideos);
            setIsSubscribed(responseData.isSubscribed);
            setTotalLikes(responseData.totalLikes);
            setTotalViews(responseData.totalViews);
        } catch (error) {
            console.error("Error fetching statistics:", error);
            setSubscriberCount(0);
            setTotalVideos(0);
            setTotalLikes(0);
            setTotalViews(0);
            setIsSubscribed(false);
        }
        finally{
            setLoading(false);
        }
    }
    useEffect(()=>{
        fetchStats();
    },[user?._id,channel?._id]);
    if(!channel) return null;
    const fullname=channel.fullName;
    const avatar=channel.avatar;
    const coverImage=channel.coverImage;
    const username=channel.username;
    const isOwner = Boolean(user && channel && channel._id === user._id);
    const handleSubscribeClick = async (e) => {
        e.stopPropagation();
        if (!user?._id) {
            navigate("/signin");
            return;
        }
        try{
            setLoading(true);
            if(isSubscribed){
                await apiClient.post(`subscriptions/${channel?._id}`);
                setIsSubscribed(false);
            }
            else{
                await apiClient.post(`subscriptions/${channel._id}`);
                setIsSubscribed(true);
            }
        }
        finally{
            setLoading(false);
        }
    }
    const handleBackdropClick = (e, closeFunction) => {
        if (e.target === e.currentTarget) closeFunction();
    };
    const handleEditCoverImageSubmit = async (e) => {
        if (e) e.preventDefault();
        if (!coverImageFile) {
            setCoverImageError("Please select a cover image file.");
            return;
        }
        try {
            setLoading(true);
            setCoverImageError("");
            const formData = new FormData();
            formData.append("coverImage", coverImageFile);
            await apiClient.patch('/users/update-coverImage', formData);
            setIsEditCoverImageModalOpen(false);
            setCoverImageFile(null);
            window.location.reload();
        } catch (error) {
            console.error(error);
            setCoverImageError(error?.response?.data?.message || "Failed to update cover image.");
        } finally {
            setLoading(false);
        }
    };
    const handleEditAvatarSubmit = async (e) => {
        if (e) e.preventDefault();
        if (!avatarFile) {
            setAvatarError("Please select an avatar file.");
            return;
        }
        try {
            setLoading(true);
            setAvatarError("");
            const formData = new FormData();
            formData.append("avatar", avatarFile);
            await apiClient.patch('/users/update-avatar', formData);
            setIsEditAvatarModalOpen(false);
            setAvatarFile(null);
            window.location.reload();
        } catch (error) {
            console.error(error);
            setAvatarError(error?.response?.data?.message || "Failed to update avatar.");
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className="w-full mb-8">
            {/* 1. Cover/Banner Image */}
            <div 
                className={`relative w-full aspect-6/1 rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800 group ${isOwner ? 'cursor-pointer' : ''}`}
                onClick={() => isOwner && setIsEditCoverImageModalOpen(true)}
            >
                <img 
                    src={coverImage || "/src/assets/placeholder-image.png"} 
                    alt="Channel Banner" 
                    className="w-full h-full object-cover"
                />
                {isOwner && (
                    <div className="absolute inset-0 bg-black/45 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                        <span className="text-white text-xs md:text-sm font-bold bg-zinc-900/80 px-3 py-1.5 rounded-full border border-zinc-700/60 shadow-lg">
                            update Cover Image
                        </span>
                    </div>
                )}
            </div>

            {/* 2. Channel Profile Details (Avatar & Info) */}
            <div className="px-4 md:px-8 flex flex-col sm:flex-row sm:items-end gap-4 md:gap-6 mb-6">
                {/* Avatar */}
                <div 
                    className={`relative shrink-0 -mt-10 sm:-mt-16 md:-mt-20 w-20 h-20 sm:w-32 sm:h-32 md:w-36 md:h-36 rounded-full overflow-hidden border-4 border-zinc-950 bg-zinc-900 shadow-2xl z-10 group ${isOwner ? 'cursor-pointer' : ''}`}
                    onClick={() => isOwner && setIsEditAvatarModalOpen(true)}
                >
                    <img 
                        src={avatar || "/src/assets/user.png"} 
                        alt={fullname} 
                        className="w-full h-full object-cover"
                    />
                    {isOwner && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                            <span className="text-white text-[10px] sm:text-xs font-bold bg-zinc-900/90 px-2.5 py-1 rounded-full border border-zinc-850 shadow-md">
                                update Avatar
                            </span>
                        </div>
                    )}
                </div>

                {/* Profile Text & Action */}
                <div className="flex-1 flex flex-col md:flex-row md:items-end md:justify-between gap-4 pb-2">
                    <div className="min-w-0">
                        <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight truncate">
                            {fullname}
                        </h1>
                        <p className="text-zinc-400 font-medium text-sm md:text-base mb-3">
                            @{username}
                        </p>

                        {/* Inline Badges/Metrics */}
                        <div className="flex flex-wrap items-center gap-2 text-xs md:text-sm font-semibold text-zinc-300">
                            <span className="px-3 py-1 bg-zinc-900/80 border border-zinc-800 rounded-full">
                                {subscriberCount} subscribers
                            </span>
                            <span className="px-3 py-1 bg-zinc-900/80 border border-zinc-800 rounded-full">
                                {totalVideos} videos
                            </span>
                            <span className="px-3 py-1 bg-zinc-900/80 border border-zinc-800 rounded-full">
                                {totalViews} views
                            </span>
                            <span className="px-3 py-1 bg-zinc-900/80 border border-zinc-800 rounded-full">
                                {totalLikes} likes
                            </span>
                        </div>
                    </div>

                    {/* Subscribe Button */}
                    <div className="shrink-0 flex items-center">
                        <button 
                            type="button" 
                            onClick={handleSubscribeClick}
                            disabled={loading || isOwner}
                            className={`rounded-full px-6 py-2 text-sm font-bold tracking-wide transition-all active:scale-95 ${
                                isSubscribed 
                                    ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700" 
                                    : "bg-white hover:bg-zinc-200 text-zinc-950"
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            {loading ? "Processing..." : isSubscribed ? "Subscribed" : "Subscribe"}
                        </button>
                    </div>
                </div>
            </div>

            {/* Edit Cover Image Modal */}
            {isEditCoverImageModalOpen && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
                    onClick={(e) => handleBackdropClick(e, () => setIsEditCoverImageModalOpen(false))}
                >
                    <div className="bg-zinc-900 border border-zinc-700 p-6 rounded-xl max-w-sm w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-xl font-bold mb-4 text-white text-center">update Cover Image</h3>
                        <form onSubmit={handleEditCoverImageSubmit}>
                            {coverImageError && (
                                <p className="text-red-500 text-xs font-semibold mb-4 text-center">{coverImageError}</p>
                            )}
                            <div className="mb-6">
                                <label className="block text-xs font-bold text-zinc-400 mb-2 uppercase">Select Cover Image File</label>
                                <input 
                                    type="file" 
                                    accept="image/*"
                                    onChange={(e) => setCoverImageFile(e.target.files[0])}
                                    className="w-full text-zinc-300 border border-zinc-700 bg-zinc-850 p-2 rounded focus:outline-none file:mr-4 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-red-600 file:text-white hover:file:bg-red-500 file:cursor-pointer"
                                />
                            </div>
                            <div className="flex justify-end gap-3">
                                <button 
                                    type="button"
                                    onClick={() => {
                                        setIsEditCoverImageModalOpen(false);
                                        setCoverImageFile(null);
                                        setCoverImageError("");
                                    }}
                                    className="px-4 py-2 text-sm font-semibold hover:bg-zinc-800 rounded-full text-zinc-400 hover:text-white transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    disabled={loading || !coverImageFile}
                                    className="px-5 py-2 text-sm font-bold bg-white text-zinc-950 hover:bg-zinc-200 rounded-full disabled:opacity-50 transition-colors"
                                >
                                    {loading ? "Updating..." : "Submit"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Avatar Modal */}
            {isEditAvatarModalOpen && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
                    onClick={(e) => handleBackdropClick(e, () => setIsEditAvatarModalOpen(false))}
                >
                    <div className="bg-zinc-900 border border-zinc-700 p-6 rounded-xl max-w-sm w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-xl font-bold mb-4 text-white text-center">update Avatar</h3>
                        <form onSubmit={handleEditAvatarSubmit}>
                            {avatarError && (
                                <p className="text-red-500 text-xs font-semibold mb-4 text-center">{avatarError}</p>
                            )}
                            <div className="mb-6">
                                <label className="block text-xs font-bold text-zinc-400 mb-2 uppercase">Select Avatar File</label>
                                <input 
                                    type="file" 
                                    accept="image/*"
                                    onChange={(e) => setAvatarFile(e.target.files[0])}
                                    className="w-full text-zinc-300 border border-zinc-700 bg-zinc-850 p-2 rounded focus:outline-none file:mr-4 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-red-600 file:text-white hover:file:bg-red-500 file:cursor-pointer"
                                />
                            </div>
                            <div className="flex justify-end gap-3">
                                <button 
                                    type="button"
                                    onClick={() => {
                                        setIsEditAvatarModalOpen(false);
                                        setAvatarFile(null);
                                        setAvatarError("");
                                    }}
                                    className="px-4 py-2 text-sm font-semibold hover:bg-zinc-800 rounded-full text-zinc-400 hover:text-white transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    disabled={loading || !avatarFile}
                                    className="px-5 py-2 text-sm font-bold bg-white text-zinc-950 hover:bg-zinc-200 rounded-full disabled:opacity-50 transition-colors"
                                >
                                    {loading ? "Updating..." : "Submit"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
export default Dashboard;