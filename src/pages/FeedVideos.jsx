import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../services/api.js";
import VideoCard from "../components/VideoCard.jsx";

const FeedVideos = () => {
    const navigate = useNavigate();
    const sentinelRef = useRef(null);

    const [videos, setVideos] = useState([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchVideos = async (pageNumber) => {
        try {
            setLoading(true);
            setError("");

            const response = await apiClient.get("/subscriptions", {
                params: {
                    page: pageNumber,
                    limit: 12,
                },
            });
            const responseData = response.data?.data;
            const newVideos = responseData.docs;
            const nextPageHasMore =responseData.hasNextPage; 
            setVideos((prev) => (pageNumber === 1 ? newVideos : [...prev, ...newVideos]));
            setHasMore(Boolean(nextPageHasMore) && newVideos.length > 0);
        } catch (err) {
            setError("Failed to load feed videos");
            setHasMore(false);
        } finally {
            setLoading(false);
            setInitialLoading(false);
        }
    };
    useEffect(() => {
        setVideos([]);
        setPage(1);
        setHasMore(true);
        setInitialLoading(true);
        fetchVideos(1);
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
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "16px" }}>
                <button
                    type="button"
                    onClick={() => navigate("/subscriptions/channels")}
                >
                    All subscriptions
                </button>
            </div>

            {error ? <p>{error}</p> : null}

            <section>
                {initialLoading ? (
                    <p>Loading feed videos...</p>
                ) : videos.length > 0 ? (
                    <div>
                        {videos.map((video) => (
                            <VideoCard key={video._id} video={video} />
                        ))}
                    </div>
                ) : (
                    <p>No feed videos found.</p>
                )}
            </section>

            {loading && !initialLoading ? <p>Loading more videos...</p> : null}

            <div ref={sentinelRef} />
        </main>
    );
};

export default FeedVideos;