import React,{useRef,useEffect,useState} from "react";
import { useSearchParams } from "react-router-dom";
import CommentCard from './CommentCard.jsx'
import apiClient from '../services/api.js'
const TweetComments=({onDeleteRequest,onUnAuthAction})=>{
    const sentinelRef=useRef(null);
    const [comments,setComments]=useState([]);
    const [page,setPage]=useState(1);
    const [hasMore,setHasMore]=useState(true);
    const [loading,setLoading]=useState(false);
    const [initialLoading,setInitialLoading]=useState(true);
    const [error,setError]=useState("");
    const [searchParams]=useSearchParams();
    const tweetId=searchParams.get("q") || "";
    const fetchComments=async (pageNumber)=>{
        try{
            setLoading(true);
            setError("");
            const response=await apiClient.get(`/comments/${tweetId}`,{
                params:{
                    page:pageNumber,limit:12
                }
            });
            const newComments=response.data.data;
            const nextPageHasMore=response.data.hasMore;
            setComments((prev)=>(pageNumber===1)?newComments:[...prev,...newComments])
            setHasMore(Boolean(nextPageHasMore));
        }
        catch(err){
            setError("Failed to load comments");
            setHasMore(false);
        }
        finally{
            setLoading(false);
            setInitialLoading(false);
        }
    }
    useEffect(()=>{
        setComments([]); setPage(1); setHasMore(true);
        fetchComments(1)
    },[tweetId])
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
        fetchComments(page);
    }, [page]);
    return(
        <main>
            {error ? <p>{error}</p> : null}
            <section>
                {initialLoading?(
                    <p>Loading comments...</p>
                ):(
                    <div>
                        {comments.map((comment)=>(
                            <CommentCard key={comment._id} comment={comment}
                                onDeleteRequest={onDeleteRequest} 
                                onUnAuthAction={onUnAuthAction} />
                        ))}
                    </div>
                )}
            </section>
            {loading && !initialLoading?<p>Loading more comments</p>:null}
            <div ref={sentinelRef}></div>
        </main>
    )
}
export default TweetComments;