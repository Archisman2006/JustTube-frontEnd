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

const PlaylistCard = ({ playlist, disableNavigation = false }) => {
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
    <article onClick={openPlaylist} role="button" tabIndex={0}>
        <div>
            <img src={thumbnail} alt={playlist.name} />
        </div>
        <div>
            <h3>{playlist.name}</h3>
            <div>
                <button type="button" onClick={openChannel}>
                    {ownerName}
                </button>
                <span>{updatedAt}</span>
            </div>
        </div>
    </article>
    );
};

export default PlaylistCard;