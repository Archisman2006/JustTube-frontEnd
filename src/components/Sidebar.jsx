import React,{useEffect, useState} from "react";
import { useNavigate } from "react-router-dom";
import apiClient from '../services/api.js'
import { useAuth } from "../context/AuthContext.jsx";
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
                const response=await apiClient.get("/subscriptions/subscribed-channels");
                setSubscribedChannels(response.data.data.docs);
            } catch (error) {
                console.log(error)
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
                        <div>
                            You
                        </div>
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
                                {visibleChannels.map((channel)=>(
                                    <button key={channel._id} type="button"
                                    onClick={()=>navigate(`/${channel.username}`/videos)}>
                                        {channel.username} {/*TODO: ADD AVATAR BESIDE CHANNEL NAME*/}
                                    </button>
                                ))}
                                <button type="button" onClick={()=>setShowAllChannels((prev)=>!prev)}>
                                {showAllChannels?"Show less":"show more"}
                                </button>
                            </div>
                        </section>
                        <section>
                            <div>
                                You
                            </div>
                            <div>
                                <button type="button" onClick={()=>navigate("/you/history")}>
                                    History
                                </button>
                                <button type="button" onClick={()=>navigate("you/liked-videos")}>
                                    Liked Videos
                                </button>
                                <button type="button" 
                                onClick={()=>navigate(`/@${user?.username}/videos`)}>
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