import React from "react";
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
const VideoCard=({video})=>{
    const navigate=useNavigate();
    if(!video) return null;
    const owner = video.owner;
    const ownerId = owner._id;
    const title = video.title;
    const fullname = owner.fullName
    const avatar = owner.avatar
    const thumbnail = video.thumbnail;
    const views = typeof video.views === "number" ? video.views : 0;
    const timeAgo = formatRelativeTime(video.createdAt);
        const openChannel=(e)=>{
            e.stopPropagation();
            navigate(`/channel/${ownerId}`);
        }
    return (
        <article onClick={()=>navigate(`/channel/${ownerId}`)}>
            <div>
                <img src={thumbnail} alt={title}/>
            </div>
            <div>
                <button type="button" onClick={openChannel}>
                    <img src={avatar} alt={username}/>
                </button>
                <div>
                    <h3>{title}</h3>
                    <button onClick={openChannel} type="button">
                        {fullname}
                    </button>
                    <p>
                        {views} views • {timeAgo}
                    </p>
                </div>
                <div>

                </div>
            </div>
        </article>
    )
}
export default VideoCard;