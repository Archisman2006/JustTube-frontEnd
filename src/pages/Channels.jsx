import React,{useRef,useEffect,useState} from "react";
import { useNavigate,useSearchParams } from "react-router-dom";
import ChannelCard from '../components/ChannelCard.jsx'
import apiClient from '../services/api.js'
const Channels=()=>{
    const navigate=useNavigate();
    const sentinelRef=useRef(null);
    const [channels,setChannels]=useState([]);
    const [page,setPage]=useState(1);
    const [hasMore,setHasMore]=useState(true);
    const [loading,setLoading]=useState(false);
    const [initialLoading,setInitialLoading]=useState(true);
    const [error,setError]=useState("");
    const [searchParams]=useSearchParams();
    const query=searchParams.get("q") || "";
    const fetchChannels=async (pageNumber)=>{
        try{
            setLoading(true);
            setError("");
            const response=await apiClient.get("/users",{
                params:{
                    page:pageNumber,limit:12
                }
            });
            const responseData=response.data.data;
            const newChannels=responseData.docs;
            const nextPageHasMore=responseData.hasNextPage;
            setChannels((prev)=>(pageNumber===1)?newChannels:[...prev,...newChannels])
            setHasMore(Boolean(nextPageHasMore));
        }
        catch(err){
            console.log(err);
            setError("Failed to load channels");
            setHasMore(false);
        }
        finally{
            setLoading(false);
            setInitialLoading(false);
        }
    }
    useEffect(()=>{
        fetchChannels(1)
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
        fetchChannels(page);
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
                <button type="button" onClick={() => handleNavigation("/playlists")}>
                    Playlists
                </button>
            </div>
            {error ? <p>{error}</p> : null}
            <section>
                {initialLoading?(
                    <p>Loading Channels...</p>
                ):(
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {channels.map((channel)=>(
                            <ChannelCard key={channel._id} channel={channel} width="100%" height="auto"/>
                        ))}
                    </div>
                )}
            </section>
            {loading && !initialLoading? <p>Loading more channels</p>:null}
            <div ref={sentinelRef}></div>
        </main>
    )
}
export default Channels;