import React,{useRef,useEffect,useState} from "react";
import { useNavigate,useSearchParams } from "react-router-dom";
import TweetCard from '../components/TweetCard.jsx'
import apiClient from '../services/api.js'
const Tweets=()=>{
    const navigate=useNavigate();
    const sentinelRef=useRef(null);
    const [tweets,setTweets]=useState([]);
    const [page,setPage]=useState(1);
    const [hasMore,setHasMore]=useState(true);
    const [loading,setLoading]=useState(false);
    const [initialLoading,setInitialLoading]=useState(true);
    const [error,setError]=useState("");
    const [searchParams]=useSearchParams();
    const query=searchParams.get("q") || "";
    const fetchTweets=async (pageNumber)=>{
        try{
            setLoading(true);
            setError("");
            const response=await apiClient.get("/tweets",{
                params:{
                    page:pageNumber,limit:12
                }
            });
            const responseData=response.data.data;
            console.log(responseData);
            const newTweets=responseData.docs;
            const nextPageHasMore=responseData.hasNextPage;
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
    useEffect(()=>{
        fetchTweets(1)
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
        const encodedQuery = encodeURIComponent(query);
        navigate(`/search${targetPath}?q=${encodedQuery}`);
    };
    return(
        <main>
            <div>
                <button type="button" onClick={() => handleNavigation("")}>
                    Videos
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
                    <p>Loading Tweets...</p>
                ):(
                    <div>
                        {tweets.map((tweet)=>(
                            <TweetCard key={tweet._id} tweet={tweet}/>
                        ))}
                    </div>
                )}
            </section>
            {loading && !initialLoading? <p>Loading more tweets</p>:null}
            <div ref={sentinelRef}></div>
        </main>
    )
}
export default Tweets;