import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../services/api.js";
import ChannelCard from "../components/ChannelCard.jsx";

const FeedChannels = () => {
    const navigate = useNavigate();
    const sentinelRef = useRef(null);

    const [channels, setChannels] = useState([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchChannels = async (pageNumber) => {
        try {
            setLoading(true);
            setError("");

            const response = await apiClient.get("/subscriptions/subscribed-channels", {
                params: {
                    page: pageNumber,
                    limit: 12,
                },
            });
            const responseData = response.data.data;
            const newChannels = responseData.docs;
            const nextPageHasMore =responseData.hasNextPage; 
            setVideos((prev) => (pageNumber === 1 ? newChannels : [...prev, ...newChannels]));
            setHasMore(Boolean(nextPageHasMore) && newChannels.length > 0);
        } catch (err) {
            setError("Failed to load feed videos");
            setHasMore(false);
        } finally {
            setLoading(false);
            setInitialLoading(false);
        }
    };
    useEffect(() => {
        setChannels([]);
        setPage(1);
        setHasMore(true);
        setInitialLoading(true);
        fetchChannels(1);
    }, []);

    useEffect(() => {
        if (!sentinelRef.current || !hasMore || loading || initialLoading) return;

        const observer = new IntersectionObserver(
            (entries) => {
                const firstEntry = entries[0];
                if (!firstEntry?.isIntersecting || loading || !hasMore) return;
                setPage((prev) => prev + 1);
            },
            {
                root: null,
                rootMargin: "200px",
                threshold: 0,
            }
        );

        observer.observe(sentinelRef.current);

        return () => observer.disconnect();
    }, [hasMore, loading, initialLoading]);

    useEffect(() => {
        if (page === 1) return;
        fetchVideos(page);
    }, [page]);

    return (
        <main>
            <div>All subscriptions</div>
            {error ? <p>{error}</p> : null}

            <section>
                {initialLoading ? (
                    <p>Loading feed channels...</p>
                ) : channels.length > 0 ? (
                    <div>
                        {channels.map((channel) => (
                            <VideoCard key={channel._id} channel={channel} />
                        ))}
                    </div>
                ) : (
                    <p>No feed channels found.</p>
                )}
            </section>

            {loading && !initialLoading ? <p>Loading more channels...</p> : null}
            <div ref={sentinelRef} />
        </main>
    );
};

export default FeedChannels;