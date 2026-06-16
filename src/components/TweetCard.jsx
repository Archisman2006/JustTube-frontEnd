import React,{useState} from "react";
import { useNavigate } from "react-router-dom";
const pluralize=(value,unit)=>`${value}${unit}${value==1?"":"s"} ago`;
const formatRelativeTime=(createdAt)=>{
    const createdDate=new Date(createdAt);
    if(Number.isNaN(createdDate.getTime())) return "";
    const diffMs=Math.max(0,Date.now()-createdDate.getTime());
    const seconds=Math.floor(diffMs/1000);
    if(seconds<60) return pluralize(seconds,"second");
    const minutes=Math.floor(seconds/60);
    if(minutes<60) return pluralize(minutes,"minute");
    const hours=Math.floor(minutes/60);
    if(hours<24) return pluralize(hours,"hour");
    const days=Math.floor(hours/24);
    if(days<30) return pluralize(days,"day");
    const months=Math.floor(days/30);
    if(months<12) return pluralize(months,"month");
    const years=Math.floor(months/12);
    return pluralize(years,"year");
}
const TweetCard=({tweet,width="100%",height="auto"})=>{
    const navigate=useNavigate();
    const [showFullContent,setShowFullContent]=useState(false);
    if(!tweet) return null;
    const owner=tweet.owner;
    const tweetId=tweet._id;
    const fullname=owner.fullName;
    const username=owner.username;
    const avatar=owner.avatar;
    const content=tweet.content;
    const image=tweet.image;
    const createdAgo=formatRelativeTime(tweet.createdAt);
    const isLongContent=content.length>250;
    const displayedContent=showFullContent || !isLongContent?content:content.slice(0,250); 
    const openTweet=()=>{
        navigate(`/view?q=${tweetId}`);
    }
    const openChannel=(e)=>{
        e.stopPropagation();
        navigate(`/${username}/videos`);
    }
    const toggleContent=(e)=>{
        e.stopPropagation();
        setShowFullContent(true);
    }
    return (
        <article
            style={{ width, height }}
            onClick={openTweet}
            className="cursor-pointer rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 transition hover:border-zinc-700 hover:bg-zinc-900/70"
        >
            <div className="flex items-start gap-3">
                <button
                    type="button"
                    onClick={openChannel}
                    className="shrink-0 rounded-full transition hover:ring-2 hover:ring-zinc-600"
                >
                    <img
                        src={avatar}
                        alt={fullname}
                        className="h-10 w-10 rounded-full object-cover ring-2 ring-zinc-700"
                    />
                </button>
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <button
                            type="button"
                            onClick={openChannel}
                            className="text-sm font-semibold text-white transition hover:text-zinc-200"
                        >
                            {fullname}
                        </button>
                        <button
                            type="button"
                            onClick={openChannel}
                            className="text-sm text-zinc-500 transition hover:text-zinc-300"
                        >
                            @{username}
                        </button>
                        <span className="text-xs text-zinc-600">· {createdAgo}</span>
                    </div>
                    <div className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-zinc-300">
                        {displayedContent}
                    </div>
                </div>
            </div>
            {image?(
                <div className="mt-3 overflow-hidden rounded-lg border border-zinc-800">
                    <img
                        src={image}
                        alt="tweet attachment"
                        className="max-h-80 w-full object-cover"
                    />
                </div>
            ):null}
        </article>
    )
}
export default TweetCard
