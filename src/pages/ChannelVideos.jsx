import React,{useState,useEffect,useRef} from "react";
import { useNavigate,useParams } from "react-router-dom";
import apiClient from '../services/api.js'
import VideoCard from '../components/VideoCard.jsx'
const ChannelVideos=()=>{
    const {username}=useParams();
    const navigate=useNavigate();
    const sentinelRef=useRef(null);
    const [videos,setVideos]=useState([]);
    const [page,setPage]=useState(1);
    const [hasMore,setHasMore]=useState(true);
    const [loading,setLoading]=useState(false);
    const [initialLoading,setInitialLoading]=useState(true);
    const [error,setError]=useState("");
    const fetchVideos=async (pageNumber)=>{
        try{
            setLoading(true);
            setError("");
            const response=await apiClient.get(`/dashboard/videos/${username}`,{
                params:{
                    page:pageNumber,limit:12
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
        fetchVideos(page);
    }, [page]);
    const handleNavigation = (targetPath) => {
        navigate(`/${username}/${targetPath}`);
    };
    return(
        <main>
            <div className="flex justify-center items-center gap-4 mb-6">
                <button 
                    type="button" 
                    onClick={() => handleNavigation("/videos")}
                    className="bg-white text-zinc-950 px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-150"
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
                    className="bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700/60 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-150 active:scale-95"
                >
                    Playlists
                </button>
            </div>
            {error ? <p>{error}</p> : null}
            <section>
                {initialLoading?(
                    <p>Loading Videos...</p>
                ):(
                    <>  
                        {videos.length==0 && <p>No Videos Posted</p>}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                            {videos.map((video)=>(
                                <VideoCard key={video._id} video={video} width="130%" height="auto"/>
                            ))}
                        </div>
                    </>
                )}
            </section>
            {loading && !initialLoading?<p>Loading more videos</p>:null}
            <div ref={sentinelRef}></div>
        </main>
    )
}
export default ChannelVideos;