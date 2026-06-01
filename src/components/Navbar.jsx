import React from "react";
import {useAuth} from '../context/AuthContext'
import { Search,EllipsisVertical, Plus } from "lucide-react";

const Navbar=()=>{
    const {user,loading}=useAuth();
    const navigate=useNavigate();
    const [query,setQuery]=useState("");
    const [isMoreOpen,setIsMoreOpen]=useState(false);
    const [isCreateOpen,setIsCreateOpen]=useState(false);
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
        if(type==="video") navigate("/create/video");
        if(type==="tweet") navigate("/create/tweet");
    }
    const handleProfileClick=()=>{
        navigate(`/profile/${user?.username}`)
    }
    return (
        <header>
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
            <div>
                <button type="button" 
                onClick={()=>setIsMoreOpen((v)=>!v)}
                aria-label="More options">
                    <EllipsisVertical size={20}/>
                </button>
                {isMoreOpen && (
                    <div>
                        <button>item 1</button>
                        <button>item 2</button>
                    </div>
                )}
            </div>
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
                                <button onClick={handleCreateNavigate("video")}>
                                Post Video
                                </button>
                                <button onClick={handleCreateNavigate("tweet")}>
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

