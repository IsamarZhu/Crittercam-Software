import { createContext, useContext, useMemo, useState } from 'react';

const VideoContext = createContext(null); // shared video state and actions

export function VideoProvider({ children }) {
  const [videos, setVideos] = useState([]); // list of all imported videos
  const [activeVideoId, setActiveVideoId] = useState(null);
  const [resolution, setResolution] = useState('low');
  const [isLoading, setIsLoading] = useState(false);
  const [globalStartMs, setGlobalStartMs] = useState(null);
  const [globalEndMs, setGlobalEndMs] = useState(null);
  const [globalCurrentMs, setGlobalCurrentMs] = useState(null);
  const [currentRelativeTime, setCurrentRelativeTime] = useState(0); // seconds within active video
  const [videoDuration, setVideoDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [volume, setVolume] = useState(1);

  const activeVideo = useMemo(
    () => videos.find((v) => v.id === activeVideoId) || null,
    [videos, activeVideoId]
  );

  const updateGlobalBounds = (videoList) => {
    if (!videoList.length) {
      setGlobalStartMs(null);
      setGlobalEndMs(null);
      return;
    }

    const start = Math.min(...videoList.map((v) => v.startMs));
    const end = Math.max(...videoList.map((v) => v.endMs));
    setGlobalStartMs(start);
    setGlobalEndMs(end);
  };

  const syncActiveVideo = (timeMs) => {
    const activeVid = videos.find((v) => timeMs >= v.startMs && timeMs < v.endMs);

    if (activeVid) {
      setActiveVideoId(activeVid.id);
      const offsetSec = (timeMs - activeVid.startMs) / 1000;
      setCurrentRelativeTime(offsetSec);
      setVideoDuration(activeVid.durationSeconds);
    } else { // no video playing
      setActiveVideoId(null);
      setCurrentRelativeTime(0);
      setVideoDuration(0);
      setIsPlaying(false);
    }
  };

  const setGlobalTime = (nextMs) => {
    if (globalStartMs === null || globalEndMs === null) return;

    const clamped = Math.min(globalEndMs, Math.max(globalStartMs, nextMs));
    setGlobalCurrentMs(clamped);
    syncActiveVideo(clamped);
  };

  // used for video slider, faster update current video time without searching for active video
  // user dragging slider -> convert gobal ms to video offset
  const setGlobalTimeInVideo = (nextMs) => {
    if (!activeVideo || globalStartMs === null || globalEndMs === null) return;

    const clamped = Math.min(globalEndMs, Math.max(globalStartMs, nextMs));
    setGlobalCurrentMs(clamped);
    const offsetSec = (clamped - activeVideo.startMs) / 1000;
    setCurrentRelativeTime(offsetSec);
  };

  // video element updates -> convert video offset to global ms
  // used to update the global time from the video component
  const setRelativeTime = (seconds) => {
    if (!activeVideo) return;

    const clamped = Math.max(0, Math.min(seconds, activeVideo.durationSeconds));
    setCurrentRelativeTime(clamped);
    setGlobalCurrentMs(activeVideo.startMs + clamped * 1000);
  };

  const loadVideoFolder = async (folderData, res) => {
    if (!folderData || !folderData.videos?.length) {
      throw new Error('No videos found in folder');
    }

    const entries = folderData.videos.map((v) => ({
      ...v,
      id: v.fileName,
      resolution: res,
    }));

    setVideos(entries);
    setResolution(res);
    setActiveVideoId(entries[0].id);
    setCurrentRelativeTime(0);
    setVideoDuration(entries[0].durationSeconds || 0);
    setIsPlaying(false);
    setGlobalStartMs(folderData.timelineStartMs);
    setGlobalEndMs(folderData.timelineEndMs);
    setGlobalCurrentMs(folderData.timelineStartMs);
  };

  const globalDurationSec =
    globalStartMs !== null && globalEndMs !== null
      ? (globalEndMs - globalStartMs) / 1000
      : 0;

  const globalOffsetSec =
    globalStartMs !== null && globalCurrentMs !== null
      ? (globalCurrentMs - globalStartMs) / 1000
      : 0;

  const value = {
    videos,
    activeVideo,
    resolution,
    isLoading,
    currentRelativeTime,
    videoDuration,
    isPlaying,
    playbackRate,
    volume,
    globalStartMs,
    globalEndMs,
    globalCurrentMs,
    globalDurationSec,
    globalOffsetSec,
    setRelativeTime,
    setGlobalTime,
    setGlobalTimeInVideo,
    setIsPlaying,
    setPlaybackRate,
    setVolume,
    loadVideoFolder,
    setResolution,
    setActiveVideoId,
  };

  return ( // context provider exposes value object to descendants, children components can use useVideo() hook to access
    <VideoContext.Provider value={value}>
      {children}
    </VideoContext.Provider>
  );
}

export function useVideo() {
  const context = useContext(VideoContext);
  if (!context) {
    throw new Error('useVideo must be used within VideoProvider');
  }
  return context;
}
