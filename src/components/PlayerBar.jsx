import React, { useState, useEffect, useRef } from "react";
import { Shuffle, SkipBack, Play, Pause, SkipForward, Repeat, Volume2, ListMusic, X, ChevronDown, ChevronUp } from "lucide-react";
import { usePlayer, getYoutubeId, getSpotifyEmbed, getSoundcloudEmbed } from "@/lib/playerContext";

let apiPromise = null;
function loadYTApi() {
  if (apiPromise) return apiPromise;
  apiPromise = new Promise((resolve) => {
    if (window.YT && window.YT.Player) return resolve(window.YT);
    window.onYouTubeIframeAPIReady = () => resolve(window.YT);
    if (!document.getElementById("yt-iframe-api")) {
      const tag = document.createElement("script");
      tag.id = "yt-iframe-api";
      tag.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(tag);
    }
  });
  return apiPromise;
}

export default function PlayerBar() {
  const { currentTrack, currentIndex, isPlaying, togglePlay, next, prev, shuffle, repeat, setShuffle, setRepeat, stop, setIsPlaying } = usePlayer();
  const [expanded, setExpanded] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(70);
  const playerRef = useRef(null);
  const ytDivRef = useRef(null);
  const stateRef = useRef({ ytId: null, isPlaying: false });
  const [ready, setReady] = useState(false);

  const ytId = currentTrack?.url ? getYoutubeId(currentTrack.url) : null;
  const isYT = !!ytId;
  const spotifyEmbed = currentTrack?.url ? getSpotifyEmbed(currentTrack.url) : null;
  const isSoundcloud = currentTrack?.url && currentTrack.url.includes("soundcloud.com");
  const showVideo = isYT && expanded;

  stateRef.current = { ytId, isPlaying };

  // Init YT player once (host div is always mounted)
  useEffect(() => {
    let alive = true;
    loadYTApi().then((YT) => {
      if (!alive || !ytDivRef.current || playerRef.current) return;
      playerRef.current = new YT.Player(ytDivRef.current, {
        height: "214",
        width: "380",
        playerVars: { autoplay: 0, controls: 1, modestbranding: 1, rel: 0 },
        events: {
          onReady: () => {
            setReady(true);
            try { playerRef.current.setVolume(volume); } catch {}
            const { ytId: id, isPlaying: play } = stateRef.current;
            if (id) {
              try { playerRef.current.loadVideoById(id); if (!play) playerRef.current.pauseVideo(); } catch {}
            }
          },
          onStateChange: (e) => {
            const S = window.YT.PlayerState;
            if (e.data === S.ENDED) next();
            else if (e.data === S.PLAYING) setIsPlaying(true);
            else if (e.data === S.PAUSED) setIsPlaying(false);
          },
        },
      });
    });
    return () => { alive = false; };
  }, []);

  // Load track when it changes
  useEffect(() => {
    if (!ready || !playerRef.current) return;
    if (isYT) {
      try { playerRef.current.loadVideoById(ytId); } catch {}
    }
  }, [ytId, currentIndex, ready]);

  // Sync play/pause
  useEffect(() => {
    if (!ready || !playerRef.current || !isYT) return;
    try {
      if (isPlaying) playerRef.current.playVideo();
      else playerRef.current.pauseVideo();
    } catch {}
  }, [isPlaying, isYT, ready]);

  // Progress polling
  useEffect(() => {
    if (!isPlaying || !isYT || !ready) return;
    const t = setInterval(() => {
      try {
        const p = playerRef.current?.getCurrentTime?.();
        const d = playerRef.current?.getDuration?.();
        if (p != null) setProgress(p);
        if (d) setDuration(d);
      } catch {}
    }, 500);
    return () => clearInterval(t);
  }, [isPlaying, isYT, ready]);

  // Volume
  useEffect(() => {
    try { playerRef.current?.setVolume?.(volume); } catch {}
  }, [volume, ready]);

  const seek = (e) => {
    if (!ready || !playerRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    try { playerRef.current.seekTo(ratio * duration, true); setProgress(ratio * duration); } catch {}
  };

  const pct = duration ? Math.min(100, (progress / duration) * 100) : 0;
  const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

  return (
    <>
      {/* YouTube host: always mounted so audio plays even when collapsed */}
      <div className={showVideo
        ? "fixed bottom-[72px] right-4 w-[380px] z-50 rounded-lg overflow-hidden shadow-2xl border border-[#222] bg-[#111] animate-fade-in"
        : "fixed bottom-0 right-0 w-px h-px overflow-hidden opacity-0 pointer-events-none z-0"}>
        {showVideo && (
          <div className="flex items-center justify-between px-3 py-2 bg-[#1a1a1a]">
            <span className="text-xs font-semibold text-[#a8f776] uppercase tracking-wider">Tocando agora</span>
            <button onClick={() => setExpanded(false)} className="text-[#808080] hover:text-white"><ChevronDown size={16} /></button>
          </div>
        )}
        <div className={showVideo ? "aspect-video bg-black" : "w-px h-px"}>
          <div ref={ytDivRef} className="w-[380px] h-[214px]" />
        </div>
      </div>

      {/* Non-YouTube expanded panel */}
      {expanded && currentTrack && !isYT && (
        <div className="fixed bottom-[72px] right-4 w-[380px] bg-[#111] border border-[#222] rounded-lg overflow-hidden shadow-2xl z-50 animate-fade-in">
          <div className="flex items-center justify-between px-3 py-2 bg-[#1a1a1a]">
            <span className="text-xs font-semibold text-[#a8f776] uppercase tracking-wider">Tocando agora</span>
            <button onClick={() => setExpanded(false)} className="text-[#808080] hover:text-white"><ChevronDown size={16} /></button>
          </div>
          <div className="aspect-video bg-black">
            {spotifyEmbed ? (
              <iframe src={`${spotifyEmbed}?theme=0`} className="w-full h-full" allow="autoplay; encrypted-media" title="player" />
            ) : isSoundcloud ? (
              <iframe src={getSoundcloudEmbed(currentTrack.url)} className="w-full h-full" allow="autoplay" title="player" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-center p-4">
                <a href={currentTrack.url} target="_blank" rel="noreferrer" className="text-[#a8f776] text-sm underline">Abrir em nova aba</a>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="h-[72px] bg-black border-t border-[#1a1a1a] flex items-center px-4 gap-4">
        {!currentTrack ? (
          <div className="w-full text-center text-[#505050] text-xs">Selecione uma faixa para tocar</div>
        ) : (
          <>
            {/* Left: track info */}
            <div className="flex items-center gap-3 w-[30%] min-w-[180px]">
              <button onClick={() => setExpanded(!expanded)} className="w-12 h-12 rounded bg-[#222] overflow-hidden shrink-0 flex items-center justify-center hover:bg-[#2a2a2a]">
                {currentTrack.band_logo ? <img src={currentTrack.band_logo} alt="" className="w-full h-full object-cover" /> : <Play size={16} className="text-[#666]" />}
              </button>
              <div className="min-w-0">
                <div className="text-sm text-white font-medium truncate">{currentTrack.title}</div>
                <div className="text-xs text-[#a0a0a0] truncate">{currentTrack.band_name || "—"}</div>
              </div>
              <button onClick={stop} className="text-[#606060] hover:text-white ml-1 hidden sm:block"><X size={16} /></button>
            </div>

            {/* Center: controls */}
            <div className="flex-1 flex flex-col items-center gap-1.5 max-w-[600px] mx-auto">
              <div className="flex items-center gap-5">
                <button onClick={() => setShuffle(!shuffle)} className={shuffle ? "text-[#a8f776]" : "text-[#a0a0a0] hover:text-white"}><Shuffle size={16} /></button>
                <button onClick={prev} className="text-[#d0d0d0] hover:text-white"><SkipBack size={20} fill="currentColor" /></button>
                <button onClick={togglePlay} className="w-9 h-9 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform">
                  {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
                </button>
                <button onClick={next} className="text-[#d0d0d0] hover:text-white"><SkipForward size={20} fill="currentColor" /></button>
                <button onClick={() => setRepeat(!repeat)} className={repeat ? "text-[#a8f776]" : "text-[#a0a0a0] hover:text-white"}><Repeat size={16} /></button>
              </div>
              <div className="w-full flex items-center gap-2">
                <span className="text-[10px] text-[#707070] tabular-nums w-8 text-right">{fmt(progress)}</span>
                <div className="flex-1 h-1 bg-[#333] rounded-full overflow-hidden cursor-pointer" onClick={seek}>
                  <div className="h-full bg-[#a8f776]" style={{ width: `${pct}%` }} />
                </div>
                <span className="text-[10px] text-[#707070] tabular-nums w-8">{duration ? fmt(duration) : "—:—"}</span>
              </div>
            </div>

            {/* Right: volume + expand */}
            <div className="flex items-center gap-3 w-[30%] min-w-[140px] justify-end">
              <button onClick={() => setExpanded(!expanded)} className="text-[#a0a0a0] hover:text-white" title={expanded ? "Recolher" : "Expandir player"}>
                {expanded ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
              </button>
              <button className="text-[#a0a0a0] hover:text-white hidden md:block"><ListMusic size={18} /></button>
              <div className="hidden lg:flex items-center gap-2">
                <Volume2 size={16} className="text-[#a0a0a0]" />
                <input type="range" min="0" max="100" value={volume} onChange={(e) => setVolume(Number(e.target.value))} className="w-20 accent-[#a8f776]" />
              </div>
              <span className="hidden lg:inline-block text-[9px] font-bold text-[#a8f776] bg-[#a8f776]/10 border border-[#a8f776]/30 px-2 py-1 rounded-full whitespace-nowrap">16-bit 44.1kHz</span>
            </div>
          </>
        )}
      </div>
    </>
  );
}