import React,{useState,useEffect,useRef} from "react";
import { useNavigate,useParams } from "react-router-dom";
import apiClient from '../services/api.js'
import PlaylistCard from '../components/PlaylistCard.jsx'
import Dashboard from "../components/Dashboard.jsx";
const ChannelPlaylists=()=>{
    const {username}=useParams();
    const navigate=useNavigate();
    const sentinelRef=useRef(null);
    const [playlists,setPlaylists]=useState([]);
    const [page,setPage]=useState(1);
    const [channel,setChannel]=useState(null);
    const [hasMore,setHasMore]=useState(true);
    const [loading,setLoading]=useState(false);
    const [initialLoading,setInitialLoading]=useState(true);
    const [error,setError]=useState("");
    const fetchPlaylists=async (pageNumber)=>{
        try{
            setLoading(true);
            setError("");
            const response=await apiClient.get(`/dashboard/playlists/${username}`,{
                params:{
                    page:pageNumber,limit:12
                }
            });
            const responseData=response.data.data;
            const newPlaylists=responseData.docs;
            const nextPageHasMore=responseData.hasNextPage;
            setPlaylists((prev)=>(pageNumber===1)?newPlaylists:[...prev,...newPlaylists])
            setHasMore(Boolean(nextPageHasMore));
        }
        catch(err){
            setError("Failed to load playlists");
            setHasMore(false);
        }
        finally{
            setLoading(false);
            setInitialLoading(false);
        }
    }
    const fetchChannel=async ()=>{
        try {
            setLoading(true);
            const response= await apiClient.get(`/users/channel/${username}`);
            setChannel(response.data.data);
        } catch (error) {
            setError(error.response.message || "Network error. Try again later");
        }
        finally{
            setLoading(false);
        }
    }
    useEffect(()=>{
        fetchPlaylists(1); fetchChannel();
    },[])
    useEffect(()=>{
        if (!sentinelRef.current || !hasMore || loading) return;
        const observer= new IntersectionObserver(
            (entries)=>{
                const firstEntry=entries[0];
                if(!firstEntry?.isIntersecting || loading || !hasMore) return;
                setPage((prev)=>prev+1);
            },{
                root:null,
                rootMargin:"200px",
                threshold:0,
            }
        );
        observer.observe(sentinelRef.current);
        return ()=>observer.disconnect();
    },[hasMore,loading]);
    useEffect(() => {
        if (page === 1) return;
        fetchPlaylists(page);
    }, [page]);
    const handleNavigation = (targetPath) => {
        navigate(`/${username}/${targetPath}`);
    };
    return(
        <main>
            <div>
                <Dashboard channel={channel}/>
            </div>
            <div className="flex justify-center items-center gap-4 mb-6">
                <button 
                    type="button" 
                    onClick={() => handleNavigation("/videos")}
                    className="bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700/60 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-150 active:scale-95"
                >
                    Videos
                </button>
                <button 
                    type="button" 
                    onClick={() => handleNavigation("/tweets")}
                    className="bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700/60 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-150 active:scale-95"
                >
                    Tweets
                </button>
                <button 
                    type="button" 
                    onClick={() => handleNavigation("/playlists")}
                    className="bg-white text-zinc-950 px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-150"
                >
                    Playlists
                </button>
            </div>
            {error ? <p>{error}</p> : null}
            <section>
                {initialLoading?(
                    <p>Loading playlists...</p>
                ):(
                    <>
                        {playlists.length===0 && <p>No Playlists created.</p>}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                            {playlists.map((playlist)=>(
                                <PlaylistCard key={playlist._id} playlist={playlist} width="100%" height="auto"/>
                            ))}
                        </div>
                    </>
                )}
            </section>
            {loading && !initialLoading?<p>Loading more playlists</p>:null}
            <div ref={sentinelRef}></div>
        </main>
    )
}
export default ChannelPlaylists;