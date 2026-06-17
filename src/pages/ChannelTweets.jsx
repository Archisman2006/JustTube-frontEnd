import React,{useState,useEffect,useRef} from "react";
import { useNavigate,useParams } from "react-router-dom";
import apiClient from '../services/api.js'
import TweetCard from '../components/TweetCard.jsx'
import Dashboard from "../components/Dashboard.jsx";
const ChannelTweets=()=>{
    const {username}=useParams();
    const navigate=useNavigate();
    const sentinelRef=useRef(null);
    const [tweets,setTweets]=useState([]);
    const [channel,setChannel]=useState(null);
    const [page,setPage]=useState(1);
    const [hasMore,setHasMore]=useState(true);
    const [loading,setLoading]=useState(false);
    const [initialLoading,setInitialLoading]=useState(true);
    const [error,setError]=useState("");
    const fetchTweets=async (pageNumber)=>{
        try{
            setLoading(true);
            setError("");
            const response=await apiClient.get(`/dashboard/tweets/${username}`,{
                params:{
                    page:pageNumber,limit:12
                }
            });
            const responseData=response.data.data;
            const newTweets=responseData.docs;
            const nextPageHasMore=responseData.hasNextPAge;
            setTweets((prev)=>(pageNumber===1)?newTweets:[...prev,...newTweets])
            setHasMore(Boolean(nextPageHasMore));
        }
        catch(err){
            setError("Failed to load tweets");
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
        fetchTweets(1),fetchChannel();
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
        fetchTweets(page);
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
                    className="bg-white text-zinc-950 px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-150"
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
                    <p>Loading tweets...</p>
                ):(
                    <>
                        {tweets.length==0 && <p>No Tweets Posted</p>}
                        <div className="flex flex-col gap-4 max-w-2xl mx-auto">
                            {tweets.map((tweet)=>(
                                <TweetCard key={tweet._id} tweet={tweet} width="100%" height="auto"/>
                            ))}
                        </div>
                    </>
                )}
            </section>
            {loading && !initialLoading?<p>Loading more tweets</p>:null}
            <div ref={sentinelRef}></div>
        </main>
    )
}
export default ChannelTweets;