// <video> wrapper with a ref

import { useEffect, useRef } from 'react';
import { Box, Text, Stack } from '@mantine/core';
import { useVideo } from '../../contexts/VideoContext';

export default function VideoViewport() {
  const videoRef = useRef(null);
  const isSeekingRef = useRef(false);

  const {
    activeVideo,
    currentRelativeTime,
    isPlaying,
    playbackRate,
    volume,
    setRelativeTime,
    setIsPlaying,
    videos,
  } = useVideo(); // hook into video context

  // useEffects to update video element based on context changes

  // update video currentTime when context currentRelativeTime changes (from external sources like slider)
  useEffect(() => {
    if (videoRef.current && activeVideo && Math.abs(videoRef.current.currentTime - currentRelativeTime) > 0.5) {
      isSeekingRef.current = true;
      videoRef.current.currentTime = currentRelativeTime;
      // reset flag after seek completes
      setTimeout(() => {
        isSeekingRef.current = false;
      }, 100);
    }
  }, [currentRelativeTime, activeVideo]);

  // update playback state
  useEffect(() => {
    if (!videoRef.current) return;

    if (!activeVideo) {
      videoRef.current.pause();
      return;
    }

    if (isPlaying) {
      videoRef.current.play().catch(() => {
        // playback might fail, silently continue
        setIsPlaying(false);
      });
    } else {
      videoRef.current.pause();
    }
  }, [isPlaying, activeVideo, setIsPlaying]);

  // update playback rate
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  // update volume
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume;
    }
  }, [volume]);

  const handleTimeUpdate = () => {
    if (videoRef.current && !isSeekingRef.current) {
      setRelativeTime(videoRef.current.currentTime);
    }
  };

  const handlePlay = () => {
    setIsPlaying(true);
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleEnded = () => {
    setIsPlaying(false);
  };

  const handleError = (e) => {
    console.error('Video failed to load', e);
  };

  if (!activeVideo) { // no video loaded, show placeholder text
    return (
      <Box
        style={{
          border: '2px dashed #adb5bd',
          borderRadius: 10,
          display: 'grid',
          placeItems: 'center',
          height: '100%',
        }}
      >
        <Stack align="center" gap="sm">
          <Text c="dimmed" fw={500}>
            No video loaded
          </Text>
          {videos.length === 0 && (
            <Text size="sm" c="dimmed">
              Import a video file to begin
            </Text>
          )}
        </Stack>
      </Box>
    );
  }

  return (
    <Box
      style={{
        border: '2px solid #dee2e6',
        borderRadius: 10,
        height: '100%',
        width: '100%',
        backgroundColor: '#000',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Box
        component="video"
        ref={videoRef}
        style={{
          maxWidth: '100%',
          maxHeight: '100%',
          width: 'auto',
          height: 'auto',
          objectFit: 'contain',
          display: 'block',
        }}
        onTimeUpdate={handleTimeUpdate}
        onPlay={handlePlay}
        onPause={handlePause}
        onEnded={handleEnded}
        onError={handleError}
        // use fileUrl if available, else fallback to file:// path
        src={activeVideo?.fileUrl || (activeVideo?.path ? `file://${activeVideo.path}` : undefined)}
      />
    </Box>
  );
}