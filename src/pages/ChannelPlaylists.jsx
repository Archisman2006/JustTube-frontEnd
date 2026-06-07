import React,{useState,useEffect} from "react";
import { useNavigate,useParams } from "react-router-dom";
import apiClient from '../context/AuthContext.jsx'
import PlaylistCard from '../components/PlaylistCard.jsx'
const ChannelPlaylists=()=>{
    const {username}=useParams();
    const navigate=useNavigate();
    const sentinelRef=useRef(null);
    const [playlists,setPlaylists]=useState([]);
    const [page,setPage]=useState(1);
    const [hasMore,setHasMore]=useState(true);
    const [loading,setLoading]=useState(false);
    const [initialLoading,setInitialLoading]=useState(true);
    const [error,setError]=useState("");
    const fetchPlaylists=async (pageNumber)=>{
        try{
            setLoading(true);
            setError("");
            const response=await apiClient.get(`/dashboard/playlists/:${username}`,{
                params:{
                    page:pageNumber,limit:12
                }
            });
            const responseData=response.data.data;
            const newPlaylists=responseData.playlists;
            const nextPageHasMore=responseData.hasMore;
            setTweets((prev)=>(pageNumber===1)?newPlaylists:[...prev,...newPlaylists])
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
    useEffect(()=>{
        fetchPlaylists(1)
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
        navigate(`/@${username}/${targetPath}`);
    };
    return(
        <main>
            <div>
                <button type="button" onClick={() => handleNavigation("/videos")}>
                    Videos
                </button>
                <button type="button" onClick={() => handleNavigation("/tweets")}>
                    Tweets
                </button>
                <button type="button" onClick={() => handleNavigation("/playlists")}>
                    Playlists
                </button>
            </div>
            {error ? <p>{error}</p> : null}
            <section>
                {initialLoading?(
                    <p>Loading playlists...</p>
                ):(
                    <div>
                        {tweets.map((playlist)=>(
                            <PlaylistCard key={playlist._id} playlist={playlist}/>
                        ))}
                    </div>
                )}
            </section>
            {loading && !initialLoading?<p>Loading more playlists</p>:null}
            <div ref={sentinelRef}></div>
        </main>
    )
}
export default ChannelPlaylists;