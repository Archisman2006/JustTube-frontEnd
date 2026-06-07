import react,{useState} from "react";
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
const CommentCard=(comment,onDeleteRequest,onUnAuthAction)=>{
    const user=useAuth();    
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
    const handleLike= async ()=>{
        if (!user) {
            if (onUnauthAction) onUnauthAction();
            return;
        }
        try {
            const response=await apiClient.post(`comments/${commentId}`);
            const isNowLiked=response.data;
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
            <div>
                <img src={avatar} alt={username}/>
                <input 
                type="text"
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)} autoFocus
                />
                <button onClick={() => {
                        setIsEditing(false);
                        setEditContent(comment.content); // Reset text on cancel
                    }} >
                    Cancle
                </button>
                <button type="button" 
                    onClick={handleSaveEdit}
                    disabled={!editContent.trim()}>
                    Save
                </button>
            </div>
        );
    }
    return (
        <div>
            <button type="button" onClick={navigateToChannel}>
                <img src={avatar} alt={username} />
            </button>
            <div>
                <div>
                    <button onClick={navigateToChannel} type="button">
                        {username}
                    </button>
                    <span>{createdAgo}</span>
                    {isOwner && (
                        <div>
                            <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
                                <MoreVertical size={18} />
                            </button>
                            
                            {isMenuOpen && (
                                <div>
                                    <button 
                                        onClick={() => {
                                            setIsEditing(true);
                                            setIsMenuOpen(false);
                                        }}
                                    >
                                        Edit
                                    </button>
                                    <button 
                                        onClick={() => {
                                            if (onDeleteRequest) onDeleteRequest(commentId);
                                            setIsMenuOpen(false);
                                        }}
                                    >
                                        Delete
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
                <div>
                    {editContent}
                </div>
                <div>
                    <button type="button" onClick={handleLike}>
                        <ThumbsUp size={16} 
                            fill={isLiked ? "currentColor" : "none"} 
                            className={isLiked ? "text-white" : "text-gray-500"}/>
                    </button>
                    <span>{likes}</span>
                </div>
            </div>
        </div>
    )
}
export default CommentCard;