import React,{useRef,useEffect,useState, use} from "react";
import { useNavigate,useSearchParams } from "react-router-dom";
import VideoCard from '../components/VideoCard.jsx'
import apiClient from '../services/api.js'
import {useAuth} from '../context/AuthContext.jsx'
const Home=()=>{
    const navigate=useNavigate();
    const {user}=useAuth();
    const sentinelRef=useRef(null);
    const [videos,setVideos]=useState([]);
    const [page,setPage]=useState(1);
    const [hasMore,setHasMore]=useState(true);
    const [loading,setLoading]=useState(false);
    const [initialLoading,setInitialLoading]=useState(true);
    const [error,setError]=useState("");
    const [searchParams]=useSearchParams();
    const query=searchParams.get("q") || "";
    const fetchVideos=async (pageNumber)=>{
        try{
            setLoading(true);
            setError("");
            const response=await apiClient.get("/videos",{
                params:{
                    page:pageNumber,limit:12,query
                }
            });
            const responseData=response.data.data;
            const newVideos=responseData.docs;
            const nextPageHasMore=responseData.hasNextPage;
            setVideos((prev)=>(pageNumber===1)?newVideos:[...prev,...newVideos])
            setHasMore(Boolean(nextPageHasMore));
        }
        catch(err){
            setError("Failed to load videos");
            setHasMore(false);
        }
        finally{
            setLoading(false);
            setInitialLoading(false);
        }
    }
    useEffect(()=>{
        fetchVideos(1)
    },[query])
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
        fetchVideos(page);
    }, [page]);
    const handleNavigation = (targetPath) => {
        const encodedQuery = encodeURIComponent(query);
        navigate(`/search${targetPath}?q=${encodedQuery}`);
    };
    return(
        <main>
            <div>
                {user && (<p>{user.username}</p>)}
                <button type="button" onClick={() => handleNavigation("/tweets")}>
                    Tweets
                </button>
                <button type="button" onClick={() => handleNavigation("/channels")}>
                    Channels
                </button>
                <button type="button" onClick={() => handleNavigation("/playlists")}>
                    Playlists
                </button>
            </div>
            {error ? <p>{error}</p> : null}
            <section>
                {initialLoading?(
                    <p>Loading Videos...</p>
                ):(
                    <div>
                        {videos.map((video)=>(
                            <VideoCard key={video._id} video={video}/>
                        ))}
                    </div>
                )}
            </section>
            {loading && !initialLoading?<p>Loading more videos</p>:null}
            <div ref={sentinelRef}></div>
        </main>
    )
}
export default Home;