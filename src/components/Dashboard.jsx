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
    const [loading,setLoading]=useState(false);
    if(!channel) return null;
    const owner=channel.owner;
    const fullname=channel.fullname;
    const avatar=channel.avatar;
    const coverImage=channel.coverImage;
    const username=channel.username;
    const fetchStats=async ()=>{
        if(!user?._id || !channel._id){
            setSubscriberCount(0); setTotalVideos(0);
            return;
        }
        try {
            const response=await apiClient.get(`/dashboard/${channel._id}`);
            setSubscriberCount(response.data.data.subscriberCount);
            setTotalVideos(response.data.data.totalVideos);
        } catch (error) {
            setSubscriberCount(0); setTotalVideos(0);
        }
    }
    const fetchSubscriptionStatus=async ()=>{
        if(!user?._id || !channel._id){
            setIsSubscribed(false);
            return;
        }
        try {
            const response=await apiClient.get(`/users/channel`,{
                params:{
                    username:channel?.userName
                }
            });
            setIsSubscribed(Boolean(response.data.data.isSubscribed));
        } catch (error) {
            setIsSubscribed(false);
        }
    }
    useEffect(()=>{
        fetchSubscriptionStatus(); fetchStats();
    },[user?._id,channel?._id]);
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
        <section>
            {coverImage ?(
                <div>
                    <img src={coverImage} alt={fullname}/>
                </div>
            ):null}
            <div>
                <div>
                    <img src={avatar} alt={fullname}/>
                </div>
                <div>
                    <div>
                        <h2>{fullname}</h2>
                    </div>
                    <div>
                        <p>@{username}</p>
                        <p>{subscriberCount} subscribers</p>
                        <p>{totalVideos} videos</p>
                    </div>
                
                    <div>
                        <button type="button" onClick={handleSubscribeClick}>
                            {isSubscribed ? "Subscribed" : "Subscribe"}
                        </button>
                    </div>
                </div>
            </div>
        </section>
    )
}