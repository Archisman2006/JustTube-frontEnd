import React, { useEffect, useRef, useState, useCallback } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import 'videojs-contrib-quality-levels'; // self-registers player.qualityLevels()
import { Settings } from 'lucide-react';

const VideoPlayer = ({ options, onReady }) => {
    const videoRef = useRef(null);
    const playerRef = useRef(null);
    const menuRef = useRef(null);

    const [qualities, setQualities] = useState([]);
    const [selectedQuality, setSelectedQuality] = useState(-1); // -1 = Auto
    const [showQualityMenu, setShowQualityMenu] = useState(false);

    // Close quality menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setShowQualityMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (!options || !options.sources || options.sources.length === 0) return;

        if (!playerRef.current) {
            const videoElement = document.createElement('video-js');
            videoElement.classList.add('video-js', 'vjs-big-play-centered', 'w-full', 'h-full');
            if (videoRef.current) {
                videoRef.current.appendChild(videoElement);
            }

            const player = (playerRef.current = videojs(videoElement, options, () => {
                videojs.log('player is officially ready');

                // --- Quality Levels Setup ---
                const qualityLevels = player.qualityLevels();

                const buildLevels = () => {
                    const levels = [];
                    for (let i = 0; i < qualityLevels.length; i++) {
                        const ql = qualityLevels[i];
                        levels.push({
                            index: i,
                            height: ql.height || 0,
                            label: ql.height ? `${ql.height}p` : `Level ${i}`,
                        });
                    }
                    // Highest resolution first
                    levels.sort((a, b) => b.height - a.height);
                    setQualities(levels);
                };

                qualityLevels.on('addqualitylevel', buildLevels);
                qualityLevels.on('removequalitylevel', buildLevels);

                if (onReady) onReady(player);
            }));
        } else {
            const player = playerRef.current;
            player.autoplay(options.autoplay);
            if (options.sources) player.src(options.sources);
            // Reset quality state when source changes
            setQualities([]);
            setSelectedQuality(-1);
        }
    }, [options, videoRef]);

    // Dispose on unmount
    useEffect(() => {
        return () => {
            const player = playerRef.current;
            if (player && !player.isDisposed()) {
                player.dispose();
                playerRef.current = null;
            }
        };
    }, []);

    const handleQualityChange = useCallback((index) => {
        const player = playerRef.current;
        if (!player) return;
        const qualityLevels = player.qualityLevels();

        if (index === -1) {
            // Auto: enable all levels so the player can pick the best
            for (let i = 0; i < qualityLevels.length; i++) {
                qualityLevels[i].enabled = true;
            }
        } else {
            // Lock to a specific rendition
            for (let i = 0; i < qualityLevels.length; i++) {
                qualityLevels[i].enabled = i === index;
            }
        }
        setSelectedQuality(index);
        setShowQualityMenu(false);
    }, []);

    const selectedLabel =
        selectedQuality === -1
            ? 'Auto'
            : (qualities.find((q) => q.index === selectedQuality)?.label ?? 'Auto');

    return (
        <div
            data-vjs-player
            className="w-full rounded-lg overflow-hidden border border-red-600 relative"
        >
            <div ref={videoRef} className="w-full h-full" />

            {/* Custom Quality Selector — only shown when HLS renditions are detected */}
            {qualities.length > 1 && (
                <div
                    ref={menuRef}
                    className="absolute bottom-12 right-3 z-20 flex flex-col items-end"
                >
                    {/* Dropdown */}
                    {showQualityMenu && (
                        <div className="mb-2 bg-black/90 backdrop-blur rounded-lg overflow-hidden shadow-2xl border border-white/10 min-w-22.5">
                            <button
                                onClick={() => handleQualityChange(-1)}
                                className={`block w-full text-right px-4 py-2 text-sm transition hover:bg-white/10 ${
                                    selectedQuality === -1
                                        ? 'text-red-400 font-bold'
                                        : 'text-white'
                                }`}
                            >
                                Auto
                            </button>
                            {qualities.map((q) => (
                                <button
                                    key={q.index}
                                    onClick={() => handleQualityChange(q.index)}
                                    className={`block w-full text-right px-4 py-2 text-sm transition hover:bg-white/10 ${
                                        selectedQuality === q.index
                                            ? 'text-red-400 font-bold'
                                            : 'text-white'
                                    }`}
                                >
                                    {q.label}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Gear Button */}
                    <button
                        onClick={() => setShowQualityMenu((v) => !v)}
                        title="Video quality"
                        className="flex items-center gap-1.5 bg-black/70 hover:bg-black/90 text-white text-xs font-semibold px-2.5 py-1 rounded transition border border-white/20 select-none"
                    >
                        <Settings size={13} />
                        {selectedLabel}
                    </button>
                </div>
            )}
        </div>
    );
};

export default VideoPlayer;