import React,{useEffect, useState} from "react";
import { useNavigate } from "react-router-dom";
import apiClient from '../services/api.js'
const Sidebar=()=>{
    const navigate=useNavigate();
    const {user}=useAuth();
    const [isCollapsed,setIsCollapsed]=useState(false)
    const [showAllChannels,setShowAllChannels]=useState(false);
    const [subscribedChannels,setSubscribedChannels]=useState([]);
    const [loadingChannels,setLoadingChannels]=useState(true);
    const fetchSubscribedChannels= async ()=>{
            if(!user?._id){
                setSubscribedChannels([]);
                setLoadingChannels(false);
                return;
            }
            try {
                setLoadingChannels(true);
                const response=await apiClient.get("/subscriptions/subscribed-channels",{
                    params:{
                        subscriberId:user._id
                    }
                });
                setSubscribedChannels(response.data?.data);
            } catch (error) {
                setSubscribedChannels([]);
            } finally{
                setLoadingChannels(false);
            }
        }
    useEffect(()=>{
        fetchSubscribedChannels();
    },[user?._id])
    const visibleChannels=showAllChannels? subscribedChannels:subscribedChannels.slice(0,5);
    const toggleSidebar=()=>{
        setIsCollapsed((prev)=>!prev)
    }
    return(
        <aside>
            <div>
                <button type="button" onClick={toggleSidebar}>
                    {isCollapsed?"Expand":"Collapse"}
                </button>
            </div>
            <div>
                {isCollapsed ?(
                    <div>
                        <button type="button" onClick={()=>navigate("/")}>
                            Home
                        </button>
                        <button type="button" onClick={()=>navigate("/subscriptions")}>
                            Subscriptions
                        </button>
                        <button type="button" onClick={()=>navigate("/me")}>
                            You
                        </button>
                    </div>
                ):(
                    <div>
                        <section>
                            <button type="button" onClick={()=>navigate("/")}>
                                Home
                            </button>
                        </section>
                        <section>
                            <button type="button" onClick={()=>navigate("/subscriptions")}>
                                Subscriptions
                            </button>
                            <div>
                                {visibleChannels.map(channel=>(
                                    <button key={channel} type="button"
                                    onclick={()=>navigate(`channel/${channel._id}`)}>
                                        {channel.userName} {/*TODO: ADD AVATAR BESIDE CHANNEL NAME*/}
                                    </button>
                                ))}
                                <button type="button" onClick={setShowAllChannels((prev)=>!prev)}>
                                {showAllChannels?"Show less":"show more"}
                                </button>
                            </div>
                        </section>
                        <section>
                            <button type="button" onClick={()=>navigate("/me")}>
                                You
                            </button>
                            <div>
                                <button type="button" onClick={()=>navigate("/history")}>
                                    History
                                </button>
                                <button type="button" onClick={()=>navigate("/playlists")}>
                                    Playlists
                                </button>
                                <button type="button" onClick={()=>navigate("/liked-videos")}>
                                    Liked Videos
                                </button>
                                <button type="button" onClick={()=>navigate("/your-videos")}>
                                    Your Videos
                                </button>
                            </div>
                        </section>
                    </div>
                )}
            </div>
        </aside>
    )
}
export default Sidebar;