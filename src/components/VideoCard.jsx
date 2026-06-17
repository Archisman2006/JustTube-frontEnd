import React from "react";
import { useNavigate } from "react-router-dom";
const pluralize=(value,unit)=>`${value} ${unit}${value==1?"":"s"} ago`;
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
const VideoCard=({video,width="100%",height="auto"})=>{
    const navigate=useNavigate();
    if(!video) return null;
    const owner = video.owner;
    const ownerId = owner._id;
    const title = video.title;
    const username=owner.username;
    const fullname = owner.fullName
    const avatar = owner.avatar
    const thumbnail = video?.thumbnail || "/src/assets/images.png";
    const views = typeof video.views === "number" ? video.views : 0;
    const timeAgo = formatRelativeTime(video.createdAt);
        const openChannel=(e)=>{
            e.stopPropagation();
            navigate(`/${username}/videos`);
        }
    return (
        <article
            style={{ width, height }}
            onClick={()=>navigate(`/watch?q=${video._id}`)}
            className="group cursor-pointer overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/40 transition hover:border-zinc-700 hover:bg-zinc-900/70"
        >
            <div className="relative aspect-video w-full overflow-hidden bg-zinc-800">
                <img
                    src={thumbnail}
                    alt={title}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                />
            </div>
            <div className="flex gap-3 p-3">
                <button
                    type="button"
                    onClick={openChannel}
                    className="shrink-0 rounded-full transition hover:ring-2 hover:ring-zinc-600"
                >
                    <img
                        src={avatar}
                        alt={username}
                        className="h-9 w-9 rounded-full object-cover ring-2 ring-zinc-700"
                    />
                </button>
                <div className="min-w-0 flex-1">
                    <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-white group-hover:text-zinc-100">
                        {title}
                    </h3>
                    <button
                        onClick={openChannel}
                        type="button"
                        className="mt-1 block truncate text-xs text-zinc-400 transition hover:text-white"
                    >
                        {fullname}
                    </button>
                    <p className="mt-0.5 text-xs text-zinc-500">
                        {views} view{views>1?"s":""} • {timeAgo}
                    </p>
                </div>
                <div>
                </div>
            </div>
        </article>
    )
}
export default VideoCard;
