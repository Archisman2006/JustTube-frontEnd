import React, { useEffect, useState,useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { MoreHorizontal, ThumbsUp } from "lucide-react";
import apiClient from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import TweetComments from "../components/TweetComments.jsx";
import avatarPlaceholder from '../assets/user.png'
const pluralize = (value, unit) => `${value} ${unit}${value === 1 ? "" : "s"} ago`;
const formatRelativeTime = (createdAt) => {
    const createdDate = new Date(createdAt);
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

const ViewTweet = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const tweetId = searchParams.get("q");

    const tweetActionsRef=useRef(null);
    const [tweet, setTweet] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isTweetLiked, setIsTweetLiked] = useState(false);
    const [tweetLikesCount, setTweetLikesCount] = useState(0);
    const [commentsCount,setCommentsCount]=useState(0);
    const [commentText, setCommentText] = useState("");
    const [isCommentFocused, setIsCommentFocused] = useState(false);
    const [commentsRefreshKey, setCommentsRefreshKey] = useState(0);
    const [unAuthModalOpen, setUnAuthModalOpen] = useState(false);
    const [deleteCommentModal, setDeleteCommentModal] = useState({ isOpen: false, commentId: null });
    const [isTweetActionsOpen, setIsTweetActionsOpen] = useState(false);
    const [editTweetModal, setEditTweetModal] = useState({
        isOpen: false,
        content: "",
        image: null,
        initialContent: "",
        initialImage: "",
    });
    const [deleteTweetModal, setDeleteTweetModal] = useState({ isOpen: false, isConfirmed: false });

    useEffect(()=>{
            const handleClickOutside=(event)=>{
                if(tweetActionsRef.current && 
                    !tweetActionsRef.current.contains(event.target)){
                        setIsTweetActionsOpen(false);        
                    }
            }
            document.addEventListener("mousedown",handleClickOutside);
            return ()=>{
                document.removeEventListener("mousedown",handleClickOutside);
            }
        },[])
    useEffect(() => {
        if (unAuthModalOpen || deleteCommentModal.isOpen || editTweetModal.isOpen || deleteTweetModal.isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
        }
        return () => {
            document.body.style.overflow = "auto";
        };
    }, [unAuthModalOpen, deleteCommentModal.isOpen, editTweetModal.isOpen, deleteTweetModal.isOpen]);

    useEffect(() => {
        if (!tweetId) {
            setLoading(false);
            setTweet(null);
            return;
        }

        const fetchTweet = async () => {
            try {
                setLoading(true);
                const response = await apiClient.get(`/tweets/${tweetId}`);
                const tweetData = response.data.data.tweet;
                setTweet(tweetData);
                setCommentsCount(response.data.data.commentsCount)
                setIsTweetLiked(response.data.data.isLikedByMe || false);
                setTweetLikesCount(response.data.data.likesCount || 0);
            } catch (error) {
                console.error("Could not retrieve tweet:", error);
                setTweet(null);
            } finally {
                setLoading(false);
            }
        };

        fetchTweet();
    }, [tweetId]);

    const handleBackdropClick = (e, closeFunction) => {
        if (e.target === e.currentTarget) closeFunction();
    };

    const handleLike = async () => {
        if (!user) {
            setUnAuthModalOpen(true);
            return;
        }

        try {
            const response = await apiClient.post(`/likes/tweets/${tweetId}`);
            const isNowLiked = response?.data?.data && Object.keys(response.data.data).length > 0;
            setIsTweetLiked(isNowLiked);
            setTweetLikesCount((prev) => (isNowLiked ? prev + 1 : prev - 1));
        } catch (error) {
            console.error("Failed to toggle like on tweet");
        }
    };

    const handlePostComment = async () => {
        if (!user) {
            setUnAuthModalOpen(true);
            return;
        }
        if (!commentText.trim()) return;
        try {
            await apiClient.post(`/comments/tweets/${tweetId}`, { content: commentText });
            setCommentText("");
            setIsCommentFocused(false);
            setCommentsRefreshKey((prev) => prev + 1);
            setCommentsCount((prev)=>prev+1);
        } catch (error) {
            console.error("Failed to post comment");
        }
    };

    const handleCommentFocus = (e) => {
        if (!user) {
            e.currentTarget.blur();
            setUnAuthModalOpen(true);
            return;
        }
        setIsCommentFocused(true);
    };

    const handleDeleteCommentRequest = (commentId) => {
        setDeleteCommentModal({ isOpen: true, commentId });
    };

    const handleDeleteCommentConfirm = async () => {
        if (!deleteCommentModal.commentId) return;

        try {
            await apiClient.delete(`/comments/videos/${deleteCommentModal.commentId}`);
            setDeleteCommentModal({ isOpen: false, commentId: null });
            setCommentsRefreshKey((prev) => prev + 1);
            setCommentsCount((prev)=>prev-1);
        } catch (error) {
            console.error("Failed to delete comment");
        }
    };

    const openEditTweetModal = () => {
        if (!tweet) return;
        setIsTweetActionsOpen(false);
        setEditTweetModal({
            isOpen: true,
            content: tweet.content || "",
            image: null,
            initialContent: tweet.content || "",
            initialImage: tweet.image || "",
        });
    };

    const handleEditTweetSubmit = async () => {
        const hasChanges = editTweetModal.content !== editTweetModal.initialContent || Boolean(editTweetModal.image);
        if (!hasChanges) return;

        try {
            const formData = new FormData();
            formData.append("content", editTweetModal.content);
            if (editTweetModal.image) {
                formData.append("image", editTweetModal.image);
            }
            setLoading(true);
            await apiClient.patch(`/tweets/${tweetId}`, formData,{
                headers:{
                    'content-Type':'multipart/form-data'
                }
            });
            setEditTweetModal({ isOpen: false, content: "", image: null, initialContent: "", initialImage: "" });
            const response = await apiClient.get(`/tweets/${tweetId}`);
            setTweet(response.data.data.tweet);
        } catch (error) {
            console.error("Failed to edit tweet");
        }
        finally{
            setLoading(false);
        }
    };

    const handleDeleteTweet = async () => {
        if (!deleteTweetModal.isConfirmed) return;

        try {
            await apiClient.delete(`/tweets/${tweetId}`);
            setDeleteTweetModal({ isOpen: false, isConfirmed: false });
            navigate("/");
        } catch (error) {
            console.error("Failed to delete tweet");
        }
    };

    const owner = tweet?.owner || {};
    const ownerUsername = owner.username || "";
    const ownerFullName = owner.fullName;
    const ownerAvatar = owner.avatar || "https://via.placeholder.com/48";
    const createdAgo = tweet ? formatRelativeTime(tweet.createdAt) : "";
    const isTweetOwner = Boolean(user && owner && String(owner._id ?? owner) === String(user._id ?? user.id));
    const hasEditChanges = editTweetModal.content !== editTweetModal.initialContent || Boolean(editTweetModal.image);

    if (loading) return <div className="text-white text-center mt-20 text-xl">Loading...</div>;
    if (!tweet) return <div className="text-white text-center mt-20 text-xl">Tweet not found.</div>;

    return (
        <div className="min-h-screen bg-[#0f0f0f] text-white p-4">
            <div className="max-w-3xl mx-auto">
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                    <div className="flex items-start justify-between gap-4 mb-5">
                        <div className="flex items-center gap-3 min-w-0">
                            <button
                                type="button"
                                onClick={() => navigate(`/@${ownerUsername}/videos`)}
                                className="shrink-0"
                            >
                                <img
                                    src={ownerAvatar}
                                    alt={ownerFullName}
                                    className="w-12 h-12 rounded-full object-cover"
                                />
                            </button>
                            <div className="min-w-0">
                                <button
                                    type="button"
                                    onClick={() => navigate(`/${ownerUsername}/videos`)}
                                    className="block text-left text-base font-semibold hover:underline"
                                >
                                    {ownerFullName}
                                </button>
                                <button type="button"
                                onClick={()=>navigate(`/${ownerUsername}/videos`)}>
                                    @{ownerUsername}
                                </button>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-400 shrink-0">
                            <span>{createdAgo}</span>
                            {isTweetOwner && (
                                <div className="relative">
                                    <button
                                        type="button"
                                        onClick={() => setIsTweetActionsOpen((value) => !value)}
                                        className="flex items-center justify-center w-9 h-9 rounded-full bg-zinc-800 hover:bg-zinc-700 transition"
                                        aria-label="Tweet actions"
                                    >
                                        <MoreHorizontal size={18} />
                                    </button>
                                    {isTweetActionsOpen && (
                                        <div ref={tweetActionsRef}
                                         className="absolute right-0 top-full mt-2 w-44 rounded-xl border border-zinc-700 bg-zinc-900 shadow-2xl overflow-hidden z-20">
                                            <button
                                                type="button"
                                                onClick={openEditTweetModal}
                                                className="w-full px-4 py-3 text-left text-sm font-semibold hover:bg-zinc-800 transition"
                                            >
                                                Edit tweet
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setIsTweetActionsOpen(false);
                                                    setDeleteTweetModal({ isOpen: true, isConfirmed: false });
                                                }}
                                                className="w-full px-4 py-3 text-left text-sm font-semibold hover:bg-zinc-800 transition text-red-400"
                                            >
                                                Delete tweet
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="whitespace-pre-wrap text-[15px] leading-6 text-gray-100 mb-5">
                        {tweet.content}
                    </div>

                    {tweet.image ? (
                        <div className="mb-5 overflow-hidden rounded-xl border border-zinc-800">
                            <img src={tweet.image} alt="tweet attachment" className="w-full object-cover" />
                        </div>
                    ) : null}

                    <button
                        type="button"
                        onClick={handleLike}
                        className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-full transition"
                    >
                        <ThumbsUp
                            size={20}
                            fill={isTweetLiked ? "white" : "none"}
                            className={isTweetLiked ? "text-white" : "text-gray-300"}
                        />
                        <span>{tweetLikesCount}</span>
                    </button>

                    <div className="mt-6 mb-8 text-sm font-semibold text-gray-300">
                        {commentsCount} Comment{commentsCount>1?"s":""}
                    </div>

                    <div className="mb-8">
                        <div className="flex gap-4">
                            <img
                                src={user?.avatar || avatarPlaceholder}
                                alt="Your avatar"
                                className="w-10 h-10 rounded-full object-cover"
                            />
                            <div className="flex-1">
                                <input
                                    type="text"
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                    onFocus={handleCommentFocus}
                                    placeholder="Add a comment..."
                                    className="w-full bg-transparent text-white border-b border-gray-600 focus:border-white focus:outline-none py-1 transition-colors"
                                    style={{ color: "white" }}
                                />
                                {isCommentFocused && (
                                    <div className="flex justify-end gap-2 mt-3">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIsCommentFocused(false);
                                                setCommentText("");
                                            }}
                                            className="px-4 py-2 text-sm font-semibold hover:bg-zinc-800 rounded-full"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handlePostComment}
                                            disabled={!commentText.trim()}
                                            className="px-4 py-2 text-sm font-semibold bg-red-600 text-white rounded-full disabled:opacity-50 disabled:bg-zinc-700"
                                        >
                                            Comment
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <TweetComments
                        key={commentsRefreshKey}
                        onDeleteRequest={handleDeleteCommentRequest}
                        onUnAuthAction={() => setUnAuthModalOpen(true)}
                    />
                </div>
            </div>

            {unAuthModalOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
                    onClick={(e) => handleBackdropClick(e, () => setUnAuthModalOpen(false))}
                >
                    <div className="bg-zinc-900 border border-zinc-700 p-6 rounded-xl max-w-sm w-full shadow-2xl mx-4">
                        <h3 className="text-xl font-bold mb-2">Sign in to continue</h3>
                        <p className="text-gray-400 mb-6">You need to be signed in to perform this action.</p>
                        <div className="flex justify-end gap-4">
                            <button
                                type="button"
                                onClick={() => setUnAuthModalOpen(false)}
                                className="px-4 py-2 font-semibold hover:bg-zinc-800 rounded"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate("/signin")}
                                className="px-4 py-2 font-semibold bg-red-600 hover:bg-red-500 rounded text-white"
                            >
                                Sign In
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {deleteCommentModal.isOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
                    onClick={(e) => handleBackdropClick(e, () => setDeleteCommentModal({ isOpen: false, commentId: null }))}
                >
                    <div className="bg-zinc-900 border border-zinc-700 p-6 rounded-xl max-w-sm w-full shadow-2xl mx-4">
                        <h3 className="text-xl font-bold mb-2">Delete comment</h3>
                        <p className="text-gray-400 mb-6">Delete comment permanently?</p>
                        <div className="flex justify-end gap-4">
                            <button
                                type="button"
                                onClick={() => setDeleteCommentModal({ isOpen: false, commentId: null })}
                                className="px-4 py-2 font-semibold hover:bg-zinc-800 rounded"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleDeleteCommentConfirm}
                                className="px-4 py-2 font-semibold bg-red-600 hover:bg-red-500 rounded text-white"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {editTweetModal.isOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
                    onClick={(e) =>
                        handleBackdropClick(e, () =>
                            setEditTweetModal({
                                isOpen: false,
                                content: "",
                                image: null,
                                initialContent: "",
                                initialImage: "",
                            })
                        )
                    }
                >
                    <div className="bg-zinc-900 border border-zinc-700 p-6 rounded-xl max-w-md w-full shadow-2xl mx-4">
                        <h3 className="text-xl font-bold mb-4">Edit tweet</h3>
                        <div className="flex flex-col gap-4 mb-6">
                            <div>
                                <label className="block text-sm font-semibold mb-1 text-gray-300">Content</label>
                                <textarea
                                    value={editTweetModal.content}
                                    onChange={(e) => setEditTweetModal((prev) => ({ ...prev, content: e.target.value }))}
                                    rows="4"
                                    className="w-full bg-transparent border border-zinc-700 rounded-xl px-3 py-2 focus:outline-none focus:border-white resize-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-1 text-gray-300">Image</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setEditTweetModal((prev) => ({ ...prev, image: e.target.files?.[0] || null }))}
                                    className="w-full text-sm text-gray-300 file:mr-4 file:rounded-full file:border-0 file:bg-zinc-800 file:px-4 file:py-2 file:text-white hover:file:bg-zinc-700"
                                />
                                {editTweetModal.image ? (
                                    <p className="mt-2 text-sm text-gray-400">Selected: {editTweetModal.image.name}</p>
                                ) : editTweetModal.initialImage ? (
                                    <div className="mt-3 overflow-hidden rounded-lg border border-zinc-800">
                                        <img src={editTweetModal.initialImage} alt="Current tweet attachment" className="w-full object-cover" />
                                    </div>
                                ) : null}
                            </div>
                        </div>
                        <div className="flex justify-end gap-4">
                            <button
                                type="button"
                                onClick={() =>
                                    setEditTweetModal({
                                        isOpen: false,
                                        content: "",
                                        image: null,
                                        initialContent: "",
                                        initialImage: "",
                                    })
                                }
                                className="px-4 py-2 font-semibold hover:bg-zinc-800 rounded"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleEditTweetSubmit}
                                disabled={!hasEditChanges}
                                className="px-4 py-2 font-semibold bg-white text-black hover:bg-gray-200 rounded disabled:opacity-50 disabled:bg-gray-500"
                            >
                                Edit
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {deleteTweetModal.isOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
                    onClick={(e) =>
                        handleBackdropClick(e, () => setDeleteTweetModal({ isOpen: false, isConfirmed: false }))
                    }
                >
                    <div className="bg-zinc-900 border border-zinc-700 p-6 rounded-xl max-w-sm w-full shadow-2xl mx-4">
                        <h3 className="text-xl font-bold mb-2">Permanently delete the tweet?</h3>
                        <label className="flex items-start gap-3 mb-6 text-sm text-gray-300 cursor-pointer select-none">
                            <input
                                type="checkbox"
                                checked={deleteTweetModal.isConfirmed}
                                onChange={(e) =>
                                    setDeleteTweetModal((prev) => ({ ...prev, isConfirmed: e.target.checked }))
                                }
                                className="mt-1 h-4 w-4 rounded border-zinc-600 bg-zinc-800 text-red-600 focus:ring-red-600"
                            />
                            <span>I understand that deleting this tweet is permanent.</span>
                        </label>
                        <div className="flex justify-end gap-4">
                            <button
                                type="button"
                                onClick={() => setDeleteTweetModal({ isOpen: false, isConfirmed: false })}
                                className="px-4 py-2 font-semibold hover:bg-zinc-800 rounded"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleDeleteTweet}
                                disabled={!deleteTweetModal.isConfirmed}
                                className="px-4 py-2 font-semibold bg-red-600 hover:bg-red-500 rounded text-white disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ViewTweet;
