import React, { useEffect, useRef } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css'
const VideoPlayer=({options,onReady})=>{
    const videoRef=useRef(null);
    const playerRef=useRef(null);
    useEffect(()=>{
        if(!playerRef.current){
            const videoElement=videoRef.current;
            if(!videoElement) return;
            const player=playerRef.current=videojs(videoElement,options,()=>{
                videojs.log('player is officially ready');
                if(onReady) {
                    onReady(player);
                }
            });
        }
        else{
            const player=playerRef.current;
            player.autoplay(options.autoplay)
            player.src(options.sources)
        }
    },[options,videoRef])
    useEffect(()=>{
        const player=playerRef.current;
        return ()=>{
            if(player && !player.isDisposed()){
                player.dispose();
                playerRef.current=null;
            }
        }
    },[])
    return (
        <div data-vjs-player className="w-full rounded-lg overflow-hidden border border-red-600">
            <video ref={videoRef} 
        className="video-js vjs-big-play-centered w-full h-full"/>
        </div>
    )
}
export default VideoPlayer;
/*

*/