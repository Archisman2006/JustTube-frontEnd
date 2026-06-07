import react,{ useEffect, useRef,useState } from "react";
import { useNavigate,useSearchParams } from "react-router-dom";
import apiClient from "../services/api.js";
import VideoPlayer from "../components/VideoPlayer.jsx";
const WatchVideo=()=>{
    const searchParams=useSearchParams();
    const videoId=searchParams.get('q');
    const [video,setVideo]=useState(null);
    const [loading,setLoading]=useState(false);
    const fetchVideo=async ()=>{
        try {
            const response=await apiClient.post(`/videos/${videoId}`);
            setVideo(response.data.data.updatedVideo);
        } catch (error) {
            
        }
    }
}
export default WatchVideo;
