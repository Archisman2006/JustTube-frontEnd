import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import apiClient from "../services/api.js";
import { ThumbsUp, MoreVertical, MessageSquare, ChevronDown, ChevronUp, X } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

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

const CommentCard = ({ comment, onDeleteRequest, onUnAuthAction, commentType = "video" }) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const commentId = comment._id;
    const owner = comment.owner || {};
    const username = owner.username || "anonymous";
    const avatar = owner.avatar || "";
    const createdAt = comment.createdAt;

    const [likes, setLikes] = useState(comment.likesCount || 0);
    const [isLiked, setIsLiked] = useState(comment.isLikedByMe || false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(comment.content);

    // Reply state
    const [repliesCount, setRepliesCount] = useState(comment.repliesCount || 0);
    const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
    const [replyText, setReplyText] = useState("");
    const [isSubmittingReply, setIsSubmittingReply] = useState(false);
    const [showReplies, setShowReplies] = useState(false);
    const [replies, setReplies] = useState([]);
    const [repliesPage, setRepliesPage] = useState(1);
    const [hasMoreReplies, setHasMoreReplies] = useState(false);
    const [loadingReplies, setLoadingReplies] = useState(false);

    const isDeleted = Boolean(comment?.isDeleted);
    const createdAgo = formatRelativeTime(createdAt);
    const isOwner = user && owner._id && user._id === owner._id;
    const commentActionsMenu = useRef(null);

    useEffect(() => {
        setLikes(comment.likesCount || 0);
        setIsLiked(comment.isLikedByMe || false);
        setRepliesCount(comment.repliesCount || 0);
        setEditContent(comment.content);
    }, [comment]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (commentActionsMenu.current && !commentActionsMenu.current.contains(e.target)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleLike = async () => {
        if (isDeleted) return;
        if (!user) {
            if (onUnAuthAction) onUnAuthAction();
            return;
        }
        try {
            const response = await apiClient.post(`/likes/comments/${commentId}`);
            const isNowLiked = response?.data?.data && Object.keys(response.data.data).length > 0;
            setIsLiked(isNowLiked);
            setLikes((prev) => (isNowLiked ? prev + 1 : prev - 1));
        } catch (error) {
            console.error("Failed to like comment:", error);
        }
    };

    const handleSaveEdit = async () => {
        if (isDeleted || !editContent.trim()) return;
        try {
            let endpoint = `/comments/videos/${commentId}`;
            if (comment.comment){
                endpoint = `/comments/replies/${commentId}`;
            } else if (comment.tweet || commentType === "tweet") {
                endpoint = `/comments/tweets/${commentId}`;
            }
            await apiClient.patch(endpoint, { content: editContent });
            setIsEditing(false);
        } catch (error) {
            console.error("Failed to save edit:", error);
        }
    };

    const navigateToChannel = () => {
        if (!isDeleted && username) {
            navigate(`/${username}/videos`);
        }
    };

    const handleOpenReplyModal = () => {
        if (isDeleted) return;
        if (!user) {
            if (onUnAuthAction) onUnAuthAction();
            return;
        }
        setIsReplyModalOpen(true);
    };

    const handlePostReply = async () => {
        if (isDeleted || !replyText.trim()) return;
        try {
            setIsSubmittingReply(true);
            const response = await apiClient.post(`/comments/replies/${commentId}`, {
                content: replyText.trim(),
            });
            const createdReply = response?.data?.data;
            setIsReplyModalOpen(false);
            setReplyText("");
            setRepliesCount((prev) => prev + 1);

            if (createdReply) {
                const formattedReply = {
                    ...createdReply,
                    owner: createdReply.owner?._id ? createdReply.owner : {
                        _id: user._id,
                        username: user.username,
                        avatar: user.avatar,
                        fullName: user.fullName
                    },
                    likesCount: 0,
                    isLikedByMe: false,
                    repliesCount: 0
                };
                if (!showReplies) {
                    setShowReplies(true);
                }
                setReplies((prev) => [formattedReply, ...prev]);
            }
        } catch (error) {
            console.error("Failed to post reply:", error);
        } finally {
            setIsSubmittingReply(false);
        }
    };

    const fetchReplies = async (pageNumber = 1) => {
        try {
            setLoadingReplies(true);
            const response = await apiClient.get(`/comments/replies/${commentId}`, {
                params: { page: pageNumber, limit: 5 }
            });
            const docs = response?.data?.data?.docs || [];
            const hasNext = Boolean(response?.data?.data?.hasNextPage);

            setReplies((prev) => {
                if (pageNumber === 1) return docs;
                // Avoid duplicate items when appending next page
                const existingIds = new Set(prev.map((r) => r._id));
                const newUniqueDocs = docs.filter((r) => !existingIds.has(r._id));
                return [...prev, ...newUniqueDocs];
            });
            setRepliesPage(pageNumber);
            setHasMoreReplies(hasNext);
        } catch (error) {
            console.error("Failed to fetch replies:", error);
        } finally {
            setLoadingReplies(false);
        }
    };

    const handleToggleReplies = () => {
        if (!showReplies) {
            setShowReplies(true);
            if (replies.length === 0) {
                fetchReplies(1);
            }
        } else {
            setShowReplies(false);
        }
    };

    const handleDeleteReply = async (replyId) => {
        try {
            await apiClient.delete(`/comments/replies/${replyId}`);
            setReplies((prev) => prev.filter((r) => r._id !== replyId));
            setRepliesCount((prev) => Math.max(0, prev - 1));
        } catch (error) {
            console.error("Failed to delete reply:", error);
        }
    };

    if (isEditing && !isDeleted) {
        return (
            <div className="flex items-start gap-3 py-3 w-full">
                <img src={avatar} alt={username} className="w-10 h-10 rounded-full object-cover shrink-0" />
                <div className="flex-1">
                    <input
                        type="text"
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        autoFocus
                        className="w-full bg-transparent text-white border-b border-zinc-600 focus:border-white focus:outline-none py-1 transition-colors text-sm"
                    />
                    <div className="flex justify-end gap-2 mt-2">
                        <button
                            type="button"
                            onClick={() => {
                                setIsEditing(false);
                                setEditContent(comment.content);
                            }}
                            className="px-3 py-1.5 text-xs font-semibold text-gray-300 hover:bg-zinc-800 rounded-full transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleSaveEdit}
                            disabled={!editContent.trim()}
                            className="px-3 py-1.5 text-xs font-semibold bg-white text-black hover:bg-gray-200 rounded-full transition disabled:opacity-50 disabled:bg-zinc-700 disabled:text-gray-400"
                        >
                            Save
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-start gap-3 py-3 w-full">
            {isDeleted ? (
                <div className="shrink-0 select-none">
                    <img src={avatar} alt={username} className="w-10 h-10 rounded-full object-cover opacity-60 pointer-events-none" />
                </div>
            ) : (
                <button
                    type="button"
                    onClick={navigateToChannel}
                    className="shrink-0 focus:outline-none"
                >
                    <img src={avatar} alt={username} className="w-10 h-10 rounded-full object-cover" />
                </button>
            )}

            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                        {isDeleted ? (
                            <span className="font-bold text-xs text-gray-400 cursor-default select-none">
                                @{username}
                            </span>
                        ) : (
                            <button
                                onClick={navigateToChannel}
                                type="button"
                                className="font-bold text-xs text-gray-200 hover:text-white focus:outline-none text-left"
                            >
                                @{username}
                            </button>
                        )}
                        {!isDeleted && <span className="text-xs text-gray-400">{createdAgo}</span>}
                    </div>

                    {isOwner && !isDeleted && (
                        <div className="relative">
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                type="button"
                                className="p-1 text-gray-400 hover:text-white rounded-full hover:bg-zinc-800 transition focus:outline-none"
                            >
                                <MoreVertical size={16} />
                            </button>

                            {isMenuOpen && (
                                <div
                                    ref={commentActionsMenu}
                                    className="absolute right-0 top-full mt-1 w-28 rounded-lg bg-zinc-900 border border-zinc-800 shadow-xl overflow-hidden z-10"
                                >
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsEditing(true);
                                            setIsMenuOpen(false);
                                        }}
                                        className="w-full text-left px-3 py-2 text-xs text-gray-200 hover:bg-zinc-800 transition font-medium"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (onDeleteRequest) onDeleteRequest(commentId);
                                            setIsMenuOpen(false);
                                        }}
                                        className="w-full text-left px-3 py-2 text-xs text-red-400 hover:bg-zinc-800 transition font-medium"
                                    >
                                        Delete
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className={`text-sm whitespace-pre-wrap wrap-break-word mt-1 mb-2 ${isDeleted ? "italic text-gray-400 select-none" : "text-gray-100"}`}>
                    {comment.content || "[deleted]"}
                </div>

                {/* Like & Reply Action Row */}
                {!isDeleted && (
                    <div className="flex items-center gap-4 text-xs text-gray-400 mt-1">
                        <div className="flex items-center gap-1">
                            <button
                                type="button"
                                onClick={handleLike}
                                className="flex items-center justify-center p-1 text-gray-400 hover:text-white hover:bg-zinc-800 rounded-full transition focus:outline-none"
                            >
                                <ThumbsUp
                                    size={14}
                                    fill={isLiked ? "currentColor" : "none"}
                                    className={isLiked ? "text-white" : "text-gray-400"}
                                />
                            </button>
                            <span className="min-w-3">{likes}</span>
                        </div>

                        <button
                            type="button"
                            onClick={handleOpenReplyModal}
                            className="flex items-center gap-1.5 px-2.5 py-1 text-gray-400 hover:text-white hover:bg-zinc-800 rounded-full transition focus:outline-none font-medium"
                        >
                            <MessageSquare size={14} />
                            <span>Reply</span>
                        </button>
                    </div>
                )}

                {/* X replies toggle button */}
                {repliesCount > 0 && (
                    <div className="mt-2">
                        {!showReplies ? (
                            <button
                                type="button"
                                onClick={handleToggleReplies}
                                className="flex items-center gap-1 text-xs font-semibold text-blue-400 hover:text-blue-300 focus:outline-none transition"
                            >
                                <ChevronDown size={14} />
                                <span>
                                    {repliesCount} {repliesCount === 1 ? "reply" : "replies"}
                                </span>
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={() => setShowReplies(false)}
                                className="flex items-center gap-1 text-xs font-semibold text-blue-400 hover:text-blue-300 focus:outline-none transition mb-1"
                            >
                                <ChevronUp size={14} />
                                <span>Hide replies</span>
                            </button>
                        )}
                    </div>
                )}

                {/* Nested Replies Section */}
                {showReplies && (
                    <div className="mt-2 pl-3 sm:pl-5 border-l-2 border-zinc-800 space-y-1">
                        {replies.map((reply) => (
                            <CommentCard
                                key={reply._id}
                                comment={reply}
                                commentType={commentType}
                                onDeleteRequest={handleDeleteReply}
                                onUnAuthAction={onUnAuthAction}
                            />
                        ))}

                        {loadingReplies && (
                            <p className="text-xs text-gray-400 py-2">Loading replies...</p>
                        )}

                        {hasMoreReplies && !loadingReplies && (
                            <div className="pt-1">
                                <button
                                    type="button"
                                    onClick={() => fetchReplies(repliesPage + 1)}
                                    className="text-xs text-blue-400 hover:text-blue-300 font-semibold focus:outline-none transition"
                                >
                                    Show more replies
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Write Reply Modal */}
            {isReplyModalOpen && createPortal(
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) setIsReplyModalOpen(false);
                    }}
                >
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 max-w-lg w-full shadow-2xl">
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="text-sm font-semibold text-white">
                                Replying to <span className="text-blue-400">@{username}</span>
                            </h3>
                            <button
                                type="button"
                                onClick={() => setIsReplyModalOpen(false)}
                                className="p-1 text-gray-400 hover:text-white rounded-full hover:bg-zinc-800 transition"
                            >
                                <X size={16} />
                            </button>
                        </div>
                        <textarea
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder="Write a reply..."
                            rows={3}
                            autoFocus
                            className="w-full bg-zinc-800 text-white rounded-lg p-3 text-sm border border-zinc-700 focus:border-white focus:outline-none resize-none transition"
                        />
                        <div className="flex justify-end gap-2 mt-3">
                            <button
                                type="button"
                                onClick={() => {
                                    setIsReplyModalOpen(false);
                                    setReplyText("");
                                }}
                                className="px-4 py-1.5 text-xs font-semibold text-gray-300 hover:bg-zinc-800 rounded-full transition"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handlePostReply}
                                disabled={!replyText.trim() || isSubmittingReply}
                                className="px-4 py-1.5 text-xs font-semibold bg-white text-black hover:bg-gray-200 rounded-full transition disabled:opacity-50 disabled:bg-zinc-700 disabled:text-gray-400"
                            >
                                {isSubmittingReply ? "Replying..." : "Reply"}
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default CommentCard;
