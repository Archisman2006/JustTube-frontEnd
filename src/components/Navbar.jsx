import React,{useEffect, useState, useRef} from "react";
import {useAuth} from '../context/AuthContext'
import { Search,EllipsisVertical, Plus } from "lucide-react";
import { useNavigate,Link } from "react-router-dom";
import apiClient from "../services/api.js";
const Navbar=()=>{
    const {user,loading,logout}=useAuth();
    const navigate=useNavigate();
    const [query,setQuery]=useState("");
    const [isMoreOpen,setIsMoreOpen]=useState(false);
    const [isCreateOpen,setIsCreateOpen]=useState(false);
    const [isLoading,setIsLoading]=useState(false);
    const [error,setError]=useState(null);
    const moreMenuRef=useRef(null);
    const createMenuRef=useRef(null);

    useEffect(()=>{
        const handleClickOutside=(event)=>{
            if(moreMenuRef.current && !moreMenuRef.current.contains(event.target)){
                setIsMoreOpen(false);
            }
            if(createMenuRef.current && !createMenuRef.current.contains(event.target)){
                setIsCreateOpen(false);
            }
        };
        document.addEventListener("mousedown",handleClickOutside);
        return ()=>{
            document.removeEventListener("mousedown",handleClickOutside);
        };
    },[]);
    const avatarSrc=user?.avatar || "";
    const displayName=user?.username || "User";
    const handleSearch=(e)=>{
        e.preventDefault();
        const trimmed=query.trim();
        if(!trimmed) return;
        navigate(`/search?q=${encodeURIComponent(trimmed)}`);
    }
    const handleCreateNavigate=(type)=>{
        setIsCreateOpen(false);
        if(type==="video") navigate("/post/video");
        if(type==="tweet") navigate("/post/tweet");
    }
    const handleProfileClick=()=>{
        navigate(`/${user?.username}/videos`)
    }
    const handleSignOut=async ()=>{
        if(!user) return;
        try {
            const response=await apiClient.post('users/logout');
            logout();
        } catch (error) {
            console.log(error);
            setError(error.response?.data?.message || "error occured while logging out")
        }
        finally{
            setIsLoading(false);
        }
    }
    useEffect(()=>{
        if(!user) navigate('/');
    },[user])
    return (
        <header className="sticky top-0 z-50 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800">
            <div className="flex items-center justify-between px-6 py-3 gap-4">
                <div className="flex items-center gap-3 shrink-0">
                    <Link
                        to="/"
                        className="text-xl font-bold tracking-tight text-white hover:text-zinc-200 transition-colors"
                    >
                        JustTube
                    </Link>
                </div>

                <form onSubmit={handleSearch} className="flex-1 max-w-2xl mx-4">
                    <div className="flex items-center gap-1">
                        <input
                            type="text"
                            value={query}
                            onChange={(e)=>setQuery(e.target.value)}
                            placeholder="Search"
                            className="w-full bg-zinc-900 border border-zinc-700 rounded-full px-4 py-2 text-white placeholder:text-zinc-500 focus:outline-none focus:border-zinc-500 transition-colors"
                        />
                        <button
                            type="submit"
                            aria-label="Search"
                            className="hover:bg-zinc-800 rounded-full p-2 text-zinc-300 hover:text-white transition shrink-0"
                        >
                            <Search size={18}/>
                        </button>
                    </div>
                </form>

                <div className="flex items-center gap-1 shrink-0">
                    { user &&
                    <div className="relative" ref={moreMenuRef}>
                        <button
                            type="button"
                            onClick={()=>setIsMoreOpen((v)=>!v)}
                            aria-label="More options"
                            className="hover:bg-zinc-800 rounded-full p-2 text-zinc-300 hover:text-white transition"
                        >
                            <EllipsisVertical size={20}/>
                        </button>
                        {isMoreOpen && (
                            <div className="absolute right-0 top-full mt-2 w-44 rounded-xl border border-zinc-700 bg-zinc-900 py-1 shadow-xl shadow-black/40">
                                <button
                                    type="button"
                                    onClick={handleSignOut}
                                    className="w-full px-4 py-2.5 text-left text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition"
                                >
                                    Sign Out
                                </button>
                            </div>
                        )}
                    </div>
                    }
                    {!loading && user ?(
                        <>
                            <div className="relative" ref={createMenuRef}>
                                <button
                                    type="button"
                                    onClick={()=>setIsCreateOpen((v)=>!v)}
                                    className="flex items-center gap-1.5 hover:bg-zinc-800 rounded-full px-3 py-2 text-zinc-300 hover:text-white transition"
                                >
                                    <Plus size={16}/>
                                    Create
                                </button>
                                {isCreateOpen && (
                                    <div className="absolute right-0 top-full mt-2 w-44 rounded-xl border border-zinc-700 bg-zinc-900 py-1 shadow-xl shadow-black/40">
                                        <button
                                            onClick={()=>handleCreateNavigate("video")}
                                            className="w-full px-4 py-2.5 text-left text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition"
                                        >
                                            Post Video
                                        </button>
                                        <button
                                            onClick={()=>handleCreateNavigate("tweet")}
                                            className="w-full px-4 py-2.5 text-left text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition"
                                        >
                                            Post Tweet
                                        </button>
                                    </div>
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={handleProfileClick}
                                aria-label="open profile"
                                title={displayName}
                                className="flex items-center justify-center h-8 w-8 rounded-full bg-zinc-800 text-zinc-300 hover:text-white ring-2 ring-zinc-700 hover:ring-rose-500 overflow-hidden transition-all duration-200 shrink-0"
                            >
                                {avatarSrc ? (
                                    <img
                                        src={avatarSrc}
                                        alt={displayName}
                                        className="h-full w-full object-cover"
                                        onError={(e) => {
                                            // Handle broken URL images by hiding the image and falling back
                                            e.target.style.display = 'none';
                                            e.target.nextSibling.style.display = 'flex';
                                        }}
                                    />
                                ) : null}
                                <span 
                                    className="text-xs font-bold uppercase select-none"
                                    style={{ display: avatarSrc ? 'none' : 'flex' }}
                                >
                                    {displayName.charAt(0)}
                                </span>
                            </button>
                        </>
                    ):(
                        <button
                            type="button"
                            onClick={()=>navigate("/signin")}
                            className="rounded-full border border-zinc-600 px-4 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white hover:border-zinc-500 transition"
                        >
                            Sign In
                        </button>
                    )}
                </div>
            </div>
        </header>
    )
}
export default Navbar;
