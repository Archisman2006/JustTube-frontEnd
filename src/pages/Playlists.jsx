import React,{useRef,useEffect,useState} from "react";
import { useNavigate,useSearchParams } from "react-router-dom";
import PlaylistCard from '../components/PlaylistCard.jsx'
import apiClient from '../services/api.js'
const Playlists=()=>{
    const navigate=useNavigate();
    const sentinelRef=useRef(null);
    const [playlists,setPlaylists]=useState([]);
    const [page,setPage]=useState(1);
    const [hasMore,setHasMore]=useState(true);
    const [loading,setLoading]=useState(false);
    const [initialLoading,setInitialLoading]=useState(true);
    const [error,setError]=useState("");
    const [searchParams]=useSearchParams();
    const query=searchParams.get("q") || "";
    const fetchPlaylists=async (pageNumber)=>{
        try{
            setLoading(true);
            setError("");
            const response=await apiClient.get("/playlists",{
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
        const encodedQuery = encodeURIComponent(query);
        navigate(`/search${targetPath}?q=${encodedQuery}`);
    };
    return(
        <main>
            <div>
                <button type="button" onClick={() => handleNavigation("")}>
                    Videos
                </button>
                <button type="button" onClick={() => handleNavigation("/tweets")}>
                    Tweets
                </button>
                <button type="button" onClick={() => handleNavigation("/channels")}>
                    Channels
                </button>
            </div>
            {error ? <p>{error}</p> : null}
            <section>
                {initialLoading?(
                    <p>Loading Playlists...</p>
                ):(
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                        {playlists.map((playlist)=>(
                            <PlaylistCard key={playlist._id} playlist={playlist} width="100%" height="auto"/>
                        ))}
                    </div>
                )}
            </section>
            {loading && !initialLoading? <p>Loading more playlists</p>:null}
            <div ref={sentinelRef}></div>
        </main>
    )
}
export default Playlists;