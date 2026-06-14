import React,{useEffect,useState} from "react";
import { useNavigate } from "react-router-dom";
import {useAuth} from '../context/AuthContext.jsx'
import apiClient from "../services/api.js";

const ChannelCard=({channel})=>{
    const navigate=useNavigate();
    const {user}=useAuth();
    const [isSubscribed,setIsSubscribed]=useState(false);
    const [loading,setLoading]=useState(false);
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
                await apiClient.post("subscriptions",{
                    params:{
                        channelId: channel._id
                    }
                });
                setIsSubscribed(false);
            }
            else{
                await apiClient.post("subscriptions",{
                    params:{
                        channelId: channel._id
                    }
                });
                setIsSubscribed(true);
            }
        }
        finally{
            setLoading(false);
        }
    }
    return (
        <article onClick={openChannel}>
            <div>
                <div>
                    <img src={channel.avatar} alt={channel.fullName}/>
                </div>
                <div>
                    <h3>{channel.fullName}</h3>
                    <p>@{channel.username}</p>
                </div>
                <div>
                    <button onClick={handleSubscribeClick} disabled={loading}>
                        {isSubscribed?"Unsubscribe":"subscribe"}
                    </button>
                </div>
            </div>
        </article>
    )
}
export default ChannelCard;