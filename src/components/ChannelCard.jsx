import React,{useEffect,useState} from "react";
import { useNavigate } from "react-router-dom";
import {useAuth} from '../context/AuthContext.jsx'
import apiClient from "../services/api.js";

const ChannelCard=({channel,width="100%",height="auto"})=>{
    const navigate=useNavigate();
    const {user}=useAuth();
    const [isSubscribed,setIsSubscribed]=useState(false);
    const [loading,setLoading]=useState(false);
    const isOwner=(user && user._id===channel._id);
    if(!channel) return null;
    const fetchSubscriptionStatus=async ()=>{
        if(!user?._id || !channel._id){
            setIsSubscribed(false);
            return;
        }
        try {
            const response=await apiClient.get(`/users/channel/${channel?.username}`);
            setIsSubscribed(Boolean(response.data.data.isSubscribed));
        } catch (error) {
            setIsSubscribed(false);
        }
    }
    useEffect(()=>{
        fetchSubscriptionStatus();

    },[user?._id,channel?._id]);
    const openChannel = () => {
    navigate(`/${channel.username}/videos`);
    };
    const handleSubscribeClick = async (e) => {
        e.stopPropagation();
        if (!user?._id) {
            navigate("/signin");
            return;
        }
        try{
            setLoading(true);
            if(isSubscribed){
                await apiClient.post(`subscriptions/${channel._id}`);
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
    return (
        <article
            style={{ width, height }}
            onClick={openChannel}
            className="cursor-pointer rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 transition hover:border-zinc-700 hover:bg-zinc-900/70"
        >
            <div className="flex items-center gap-4">
                <div className="shrink-0">
                    <img
                        src={channel.avatar}
                        alt={channel.fullName}
                        className="h-14 w-14 rounded-full object-cover ring-2 ring-zinc-700"
                    />
                </div>
                <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-semibold text-white">
                        {channel.fullName}
                    </h3>
                    <p className="truncate text-xs text-zinc-500">@{channel.username}</p>
                </div>
                <div className="shrink-0">
                    <button
                        onClick={handleSubscribeClick}
                        disabled={loading || isOwner}
                        className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                            isSubscribed
                                ? "border border-zinc-600 bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                                : "bg-white text-zinc-950 hover:bg-zinc-200"
                        } disabled:cursor-not-allowed disabled:opacity-60`}
                    >
                        {isSubscribed?"Unsubscribe":"subscribe"}
                    </button>
                </div>
            </div>
        </article>
    )
}
export default ChannelCard;
