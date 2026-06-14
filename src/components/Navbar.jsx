import React,{useEffect, useState} from "react";
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
        <header>
            {user?.username}
            <div>
                <Link to="/">JustTube</Link>
            </div>
            <form onSubmit={handleSearch}>
                <div>
                    <input type="text" value={query} 
                    onChange={(e)=>setQuery(e.target.value)} 
                    placeholder="search"/>
                    <button
                    type="submit" aria-label="Search">
                        <Search size={18}/>
                    </button>
                </div>
            </form>
            { user &&
            <div>
                <button type="button" 
                onClick={()=>setIsMoreOpen((v)=>!v)}
                aria-label="More options">
                    <EllipsisVertical size={20}/>
                </button>
                {isMoreOpen && (
                    <div>
                        <button type="button" onClick={handleSignOut}>Sign Out</button>
                    </div>
                )}
            </div>
            }       
            {!loading && user ?(
                <>
                    <div>
                        <button
                        type="button" onClick={()=>setIsCreateOpen((v)=>!v)}>
                            <Plus size={16}/>
                            Create
                        </button>
                        {isCreateOpen && (
                            <div>
                                <button onClick={()=>handleCreateNavigate("video")}>
                                Post Video
                                </button>
                                <button onClick={()=>handleCreateNavigate("tweet")}>
                                Post Tweet
                                </button>
                            </div>
                        )}
                    </div>
                    <button type="button" onClick={handleProfileClick}
                    aria-label="open profile" title={displayName}>
                        <img src={avatarSrc} alt={displayName}/>
                    </button>
                </>
            ):(
                <button type="button" onClick={()=>navigate("/signin")}>
                    Sign In
                </button>
            )}
        </header>
    )
}
export default Navbar;

