import { createContext, useContext, useState } from 'react';

const VideoContext = createContext(null); // context to hold video state and actions

export function VideoProvider({ children }) {
  const [videoFile, setVideoFile] = useState(null);
  const [resolution, setResolution] = useState('low'); // default resolution
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [volume, setVolume] = useState(1); // 0.0 to 1.0

  const loadVideo = async (filePath, res) => {
    try {
      setIsLoading(true);
      // call main process to get video metadata
      const metadata = await window.electronAPI.getVideoMetadata(filePath);

      setVideoFile({
        ...metadata,
        resolution: res,
      });

      setResolution(res); 
      setCurrentTime(0);
      setIsPlaying(false);
      
    } catch (error) {
      console.error('Failed to load video:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    videoFile,
    resolution,
    isLoading,
    currentTime,
    videoDuration,
    isPlaying,
    playbackRate,
    volume,
    setCurrentTime,
    setVideoDuration,
    setIsPlaying,
    setPlaybackRate,
    setVolume,
    loadVideo,
    setResolution,
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
