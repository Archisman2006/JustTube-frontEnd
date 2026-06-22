import React,{useEffect, useState} from "react";
import { useNavigate } from "react-router-dom";
import apiClient from '../services/api.js'
import { useAuth } from "../context/AuthContext.jsx";
const Sidebar=()=>{
    const navigate=useNavigate();
    const {user}=useAuth();
    const [isCollapsed,setIsCollapsed]=useState(true)
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
    const navButtonClass="w-full rounded-lg px-3 py-2.5 text-left text-sm text-zinc-400 hover:bg-zinc-800 hover:text-white transition";
    return(
        <aside className={`hidden md:flex shrink-0 border-r border-zinc-800 bg-zinc-950/95 ${isCollapsed ? "w-48" : "w-60"} transition-all duration-300 sticky top-16 h-[calc(100vh-64px)] flex-col`}>
            <div className="border-b border-zinc-800 p-3 shrink-0">
                <button
                    type="button"
                    onClick={toggleSidebar}
                    className="w-full rounded-lg px-3 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white transition"
                >
                    {isCollapsed?"Expand":"Collapse"}
                </button>
            </div>
            <div className="overflow-y-auto p-3 flex-1 custom-scrollbar">
                {isCollapsed ?(
                    <div className="space-y-1">
                        <button type="button" onClick={()=>navigate("/")} className={navButtonClass}>
                            Home
                        </button>
                        <button type="button" onClick={()=>user?navigate("/subscriptions"):navigate('/signin')} className={navButtonClass}>
                            Subscriptions
                        </button>
                        <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                            You
                        </div>
                    </div>
                ):(
                    <div className="space-y-6">
                        <section className="space-y-1">
                            <button type="button" onClick={()=>navigate("/")} className={navButtonClass}>
                                Home
                            </button>
                        </section>
                        <section className="space-y-1">
                            <button type="button" onClick={()=>user?navigate("/subscriptions"):navigate('/signin')} className={navButtonClass}>
                                Subscriptions
                            </button>
                            <div className="mt-2 space-y-0.5 pl-1">
                                {visibleChannels.map((channel)=>(
                                    <button key={channel._id} type="button"
                                    onClick={()=>navigate(`/${channel.username}/videos`)}
                                    className={navButtonClass}>
                                        {channel.username} {/*TODO: ADD AVATAR BESIDE CHANNEL NAME*/}
                                    </button>
                                ))}
                                <button type="button" onClick={()=>setShowAllChannels((prev)=>!prev)} className={`${navButtonClass} text-zinc-500 hover:text-zinc-300`}>
                                {showAllChannels?"Show less":"show more"}
                                </button>
                            </div>
                        </section>
                        <section className="space-y-1">
                            <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                                You
                            </div>
                            <div className="space-y-0.5">
                                <button type="button" onClick={()=>navigate("/you/history")} className={navButtonClass}>
                                    History
                                </button>
                                <button type="button" onClick={()=>navigate("you/liked-videos")} className={navButtonClass}>
                                    Liked Videos
                                </button>
                                <button type="button"
                                onClick={()=>user? navigate(`/${user?.username}/videos`):navigate('/signin')} 
                                className={navButtonClass}>
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
