import React, { createContext, useContext, useState, useRef, useCallback } from "react";

const PlayerContext = createContext(null);

export function PlayerProvider({ children }) {
  const [queue, setQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const iframeRef = useRef(null);

  const currentTrack = currentIndex >= 0 ? queue[currentIndex] : null;

  const playTrackList = useCallback((tracks, startIndex = 0) => {
    setQueue(tracks);
    setCurrentIndex(startIndex);
    setIsPlaying(true);
  }, []);

  const playTrack = useCallback((track) => {
    setQueue([track]);
    setCurrentIndex(0);
    setIsPlaying(true);
  }, []);

  const togglePlay = useCallback(() => {
    setIsPlaying((p) => !p);
  }, []);

  const next = useCallback(() => {
    setCurrentIndex((idx) => {
      if (shuffle && queue.length > 1) {
        let r;
        do { r = Math.floor(Math.random() * queue.length); } while (r === idx);
        return r;
      }
      if (idx >= queue.length - 1) {
        return repeat ? 0 : -1;
      }
      return idx + 1;
    });
  }, [shuffle, queue.length, repeat]);

  const prev = useCallback(() => {
    setCurrentIndex((idx) => (idx <= 0 ? 0 : idx - 1));
  }, []);

  const stop = useCallback(() => {
    setQueue([]);
    setCurrentIndex(-1);
    setIsPlaying(false);
  }, []);

  return (
    <PlayerContext.Provider
      value={{
        queue,
        currentIndex,
        currentTrack,
        isPlaying,
        shuffle,
        repeat,
        playTrack,
        playTrackList,
        togglePlay,
        next,
        prev,
        stop,
        setShuffle,
        setRepeat,
        setIsPlaying,
        iframeRef,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used within PlayerProvider");
  return ctx;
}

// Helper to extract YouTube video ID
export function getYoutubeId(url) {
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}

// Helper to extract Spotify track/album/playlist id (handles intl-pt/ and other locales)
export function getSpotifyEmbed(url) {
  const m = url.match(/open\.spotify\.com\/(?:intl-\w+\/)?(track|album|playlist|artist)\/([A-Za-z0-9]+)/);
  return m ? `https://open.spotify.com/embed/${m[1]}/${m[2]}` : null;
}

// Helper to extract SoundCloud (use embed)
export function getSoundcloudEmbed(url) {
  return `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&color=%2316a34a`;
}

// Helper for Bandcamp embed
export function getBandcampEmbed(url) {
  return url;
}