import React,{useState} from "react";
import { useNavigate } from "react-router-dom";
const pluralize=(value,unit)=>`${value}${unit}${value==1?"":"s"} ago`;
const formatRelativeTime=(createdAt)=>{
    const createdDate=new Date(createdAt);
    if(Number.isNaN(createdDate.getTime())) return "";
    const diffMs=math.max(0,Date.now()-createdDate.getTime());
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
const TweetCard=({tweet})=>{
    const navigate=useNavigate();
    const [showFullContent,setShowFullContent]=useState(false);
    if(!tweet) return null;
    const owner=Video.owner;
    const tweetId=tweet._id;
    const channelId=tweet.owner._id;
    const fullname=owner.fullname;
    const username=owner.username;
    const avatar=owner.avatar;
    const content=tweet.content;
    const image=tweet.image;
    const createdAgo=formatRelativeTime(tweet.createdAt);
    const isLongContent=content.length>250;
    const displayedContent=showFullContent || !isLongContent?content:content.slice(0,250); 
    const openTweet=()=>{
        navigate("/tweet/"+tweetId);
    }
    const openChannel=(e)=>{
        e.stopPropagation();
        navigate("/channel"+channelId);
    }
    const toggleContent=(e)=>{
        e.stopPropagation();
        setShowFullContent(true);
    }
    return (
        <article onClick={openTweet}>
            <div>
                <button type="button" onClick={openChannel}>
                    <img src={avatar} alt={fullname}/>
                </button>
            <button type="button" onClick={openChannel}>
                {fullname}
            </button>
            <button type="button" onClick={openChannel}>
                @{username}
            </button>
            <span>{createdAgo}</span>
            </div>
            <div>{displayedContent}</div>
            {image?(
                <div>
                    <img src={image} alt="tweet attachment"/>
                </div>
            ):null}
        </article>
    )
}
export default TweetCard