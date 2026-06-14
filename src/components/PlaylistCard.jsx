import React from "react";
import { useNavigate } from "react-router-dom";

const pluralize = (value, unit) => `${value} ${unit}${value === 1 ? "" : "s"} ago`;
const formatRelativeTime = (dateValue) => {
    const createdDate = new Date(dateValue);
    if (Number.isNaN(createdDate.getTime())) return "";

    const diffMs = Math.max(0, Date.now() - createdDate.getTime());
    const seconds = Math.floor(diffMs / 1000);

    if (seconds < 60) return pluralize(seconds, "second");
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return pluralize(minutes, "minute");
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return pluralize(hours, "hour");
    const days = Math.floor(hours / 24);
    if (days < 30) return pluralize(days, "day");
    const months = Math.floor(days / 30);
    if (months < 12) return pluralize(months, "month");
    const years = Math.floor(months / 12);
    return pluralize(years, "year");
};

const PlaylistCard = ({ playlist, disableNavigation = false, width = "100%", height = "auto" }) => {
    const navigate = useNavigate();
    if (!playlist) return null;
    const playlistId = playlist._id;
    const owner = playlist.owner;
    const ownerId = owner?._id;
    const ownerName = owner?.fullName || owner?.username || "Unknown channel";
    const updatedAt = formatRelativeTime(playlist.updatedAt);

    const firstVideo = Array.isArray(playlist.videos) ? playlist.videos[0] : null;
    const thumbnail =
    firstVideo?.thumbnail ||
    "https://via.placeholder.com/320x180?text=No+Video";

    const openPlaylist = () => {
        if (disableNavigation) return;
        navigate(`/playlist/${playlistId}`);
    };

    const openChannel = (e) => {
    e.stopPropagation();
    if (ownerId) navigate(`/channel/${ownerId}`);
    };

    return (
    <article
        style={{ width, height }}
        onClick={openPlaylist}
        role="button"
        tabIndex={0}
        className="group cursor-pointer overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/40 transition hover:border-zinc-700 hover:bg-zinc-900/70"
    >
        <div className="relative aspect-video w-full overflow-hidden bg-zinc-800">
            <img
                src={thumbnail}
                alt={playlist.name}
                className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <span className="absolute bottom-2 right-2 rounded bg-black/70 px-2 py-0.5 text-xs font-medium text-white">
                Playlist
            </span>
        </div>
        <div className="p-3">
            <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-white group-hover:text-zinc-100">
                {playlist.name}
            </h3>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-zinc-500">
                <button
                    type="button"
                    onClick={openChannel}
                    className="truncate text-zinc-400 transition hover:text-white"
                >
                    {ownerName}
                </button>
                <span>·</span>
                <span>{updatedAt}</span>
            </div>
        </div>
    </article>
    );
};

export default PlaylistCard;
