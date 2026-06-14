import React, { useEffect, useRef } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';

const VideoPlayer = ({ options, onReady }) => {
    const videoRef = useRef(null);
    const playerRef = useRef(null);

    useEffect(() => {
        if (!options || !options.sources || options.sources.length === 0) return;

        // Make sure Video.js player is only initialized once
        if (!playerRef.current) {
            const videoElement = document.createElement("video-js");
            videoElement.classList.add('video-js', 'vjs-big-play-centered', 'w-full', 'h-full');
            if (videoRef.current) {
                videoRef.current.appendChild(videoElement);
            }

            const player = playerRef.current = videojs(videoElement, options, () => {
                videojs.log('player is officially ready');
                if (onReady) {
                    onReady(player);
                }
            });
        } else {
            const player = playerRef.current;
            player.autoplay(options.autoplay);
            if (options.sources) {
                player.src(options.sources);
            }
        }
    }, [options, videoRef]);

    // Dispose the Video.js player when the functional component unmounts
    useEffect(() => {
        return () => {
            const player = playerRef.current;
            if (player && !player.isDisposed()) {
                player.dispose();
                playerRef.current = null;
            }
        };
    }, []);

    return (
        <div data-vjs-player className="w-full rounded-lg overflow-hidden border border-red-600">
            <div ref={videoRef} className="w-full h-full" />
        </div>
    );
};

export default VideoPlayer;