import react,{useState,useEffect,useRef} from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../services/api.js";
import { ThumbsUp,MoreVertical } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
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
const CommentCard=({comment,onDeleteRequest,onUnAuthAction})=>{
    const {user}=useAuth();    
    const navigate=useNavigate();
    const commentId=comment._id;
    const owner=comment.owner;
    const username=owner.username;
    const avatar=owner.avatar;
    const createdAt=comment.createdAt;
    const content=comment.content;
    const [likes, setLikes] = useState(comment.likesCount || 0);
    // TODO: remove this and fetch if comment is liked by user from backend.
    const [isLiked, setIsLiked] = useState(comment.isLikedByMe || false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(comment.content);
    const createdAgo=formatRelativeTime(createdAt);
    const isOwner = user && user._id === owner._id;
    const commentActionsMenu=useRef(null);
    useEffect(()=>{
        const handleClickOutside=(e)=>{
            if(commentActionsMenu.current && !commentActionsMenu.current.contains(e.target)){
                setIsMenuOpen(false);
            }
        };
        document.addEventListener("mousedown",handleClickOutside);
        return ()=>{
            document.removeEventListener("mousedown",handleClickOutside);
        }
    },[])
    const handleLike= async ()=>{
        if (!user) {
            if (onUnAuthAction) onUnAuthAction();
            return;
        }
        try {
            const response=await apiClient.post(`/likes/comments/${commentId}`);
            const isNowLiked = response?.data?.data && Object.keys(response.data.data).length > 0;
            setIsLiked(isNowLiked);
            setLikes(prev => isNowLiked ? prev + 1 : prev - 1);    
        } catch (error) {
            
        }
    }
    const handleSaveEdit=async ()=>{
        if (!editContent.trim()) return;
        try {
            await apiClient.patch(`/comments/videos/${commentId}`, { content: editContent });
            setIsEditing(false);
        } catch (error) {
            console.error("Failed to save edit:", error);
        }
    }
    const navigateToChannel=()=>{
        navigate(`/@${username}/videos`);
    }
    if(isEditing){
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
                                setEditContent(comment.content); // Reset text on cancel
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
            <button 
                type="button" 
                onClick={navigateToChannel} 
                className="shrink-0 focus:outline-none"
            >
                <img src={avatar} alt={username} className="w-10 h-10 rounded-full object-cover" />
            </button>
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                        <button 
                            onClick={navigateToChannel} 
                            type="button"
                            className="font-bold text-xs text-gray-200 hover:text-white focus:outline-none text-left"
                        >
                            @{username}
                        </button>
                        <span className="text-xs text-gray-400">{createdAgo}</span>
                    </div>
                    {isOwner && (
                        <div className="relative">
                            <button 
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                type="button"
                                className="p-1 text-gray-400 hover:text-white rounded-full hover:bg-zinc-800 transition focus:outline-none"
                            >
                                <MoreVertical size={16} />
                            </button>
                            
                            {isMenuOpen && (
                                <div ref={commentActionsMenu}
                                 className="absolute right-0 top-full mt-1 w-28 rounded-lg bg-zinc-900 border border-zinc-800 shadow-xl overflow-hidden z-10" >
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
                <div className="text-sm text-gray-100 whitespace-pre-wrap wrap-break-word mt-1 mb-2">
                    {editContent}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400">
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
            </div>
        </div>
    )
}
export default CommentCard;