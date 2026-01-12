// ui buttons and controls

import { useEffect, useState } from 'react';
import { Group, ActionIcon, Slider, Text, Box, Popover } from '@mantine/core';
import { useMove } from '@mantine/hooks';
import {
  IconPlayerPlay,
  IconPlayerPause,
  IconPlayerSkipBack,
  IconPlayerSkipForward,
  IconVolume,
  IconVolumeOff,
  IconGauge,
} from '@tabler/icons-react';
import { useVideo } from '../../contexts/VideoContext';

function formatTime(seconds) {
  if (!seconds || isNaN(seconds)) return '0:00';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

export default function VideoControlStrip() {
  const [speedPopoverOpened, setSpeedPopoverOpened] = useState(false);
  const [volumePopoverOpened, setVolumePopoverOpened] = useState(false);

  // https://mantine.dev/hooks/use-move/#vertical-slider
  const { ref: volumeRef } = useMove(({ y }) => setVolume(1 - y)); 
  
  const {
    videoFile,
    currentTime,
    videoDuration,
    isPlaying,
    playbackRate,
    volume,
    setCurrentTime,
    setIsPlaying,
    setPlaybackRate,
    setVolume,
  } = useVideo(); // hook into video context

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!videoFile) return;

      switch (e.code) {
        case 'Space': // play/pause
          e.preventDefault();
          setIsPlaying((prev) => !prev);
          break;
        case 'ArrowLeft': // rewind 10s
          e.preventDefault();
          setCurrentTime(Math.max(0, currentTime - 10));
          break;
        case 'ArrowRight': // forward 10s
          e.preventDefault();
          setCurrentTime(Math.min(videoDuration, currentTime + 10));
          break;
        case 'ArrowUp': // increase speed
          e.preventDefault();
          setPlaybackRate((prev) => Math.min(2, prev + 0.25));
          break;
        case 'ArrowDown': // decrease speed
          e.preventDefault();
          setPlaybackRate((prev) => Math.max(0.25, prev - 0.25));
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown); // any key press triggers handler
    return () => window.removeEventListener('keydown', handleKeyDown);

  }, [videoFile, currentTime, videoDuration, setCurrentTime, setIsPlaying, setPlaybackRate]);

  if (!videoFile) { // no video loaded, show placeholder text
    return (
      <Group
        justify="center"
        px="sm"
        style={{
          height: '100%',
          alignItems: 'center',
          backgroundColor: '#f1f3f5',
          border: '1px solid #dee2e6',
        }}
      >
        <Text size="sm" c="dimmed">
          Use File → Import video…
        </Text>
      </Group>
    );
  }

  return (
    <Group // control strip
      justify="space-between"
      px="sm"
      py={4}
      style={{
        minHeight: '36px',
        alignItems: 'center',
        backgroundColor: '#f1f3f5',
        border: '1px solid #dee2e6',
        gap: 'xs',
      }}
    >
      {/* on the left - play/pause and time scrubbing bar */}
      <Group gap="xs" style={{ flex: 1, minWidth: 0 }}>
        <Group gap={0}>
          <ActionIcon
            variant="subtle"
            onClick={() => setCurrentTime(Math.max(0, currentTime - 10))}
            title="Back 10s (←)"
          >
            <IconPlayerSkipBack size={18} />
          </ActionIcon>

          <ActionIcon
            variant="subtle"
            onClick={() => setIsPlaying(!isPlaying)}
            title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
          >
            {/* can also be toggled with spacebar */}
            {isPlaying ? <IconPlayerPause size={18} /> : <IconPlayerPlay size={18} />}
          </ActionIcon>

          <ActionIcon
            variant="subtle"
            onClick={() => setCurrentTime(Math.min(videoDuration, currentTime + 10))}
            title="Forward 10s (→)"
          >
            <IconPlayerSkipForward size={18} />
          </ActionIcon>
        </Group>

        <Text size="xs" c="dimmed" style={{ whiteSpace: 'nowrap' }}>
          {/* current time / total duration */}
          {formatTime(currentTime)} / {formatTime(videoDuration)}
        </Text>

        <Slider
          value={currentTime}
          onChange={setCurrentTime}
          max={videoDuration}
          min={0}
          step={0.1} // TODO step size ok?
          style={{ flex: 1, minWidth: 0 }}
        />
      </Group>

      {/* in the middle - video filename */}
      <Text size="sm" c="dimmed" style={{ whiteSpace: 'nowrap' }}>
        {videoFile.fileName}
      </Text>

      {/* on the right - speed and volume buttons*/}
      <Group gap="xs">
        <Popover // speed
          opened={speedPopoverOpened} 
          onChange={setSpeedPopoverOpened}
          position="top"
          withArrow
        >
          <Popover.Target>
            <ActionIcon 
              variant="subtle" 
              onClick={() => setSpeedPopoverOpened((o) => !o)}
              title={`Speed: ${playbackRate.toFixed(2)}x`}
            >
              <IconGauge size={18} />
            </ActionIcon>
          </Popover.Target>
          <Popover.Dropdown>
            <Box style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '180px' }}>
              <Text size="xs" fw={500} style={{ minWidth: '35px' }}>{playbackRate.toFixed(2)}x</Text>
              <Slider
                value={playbackRate}
                onChange={setPlaybackRate}
                min={0.25}
                max={2}
                step={0.25}
                style={{ flex: 1 }}
              />
            </Box>
          </Popover.Dropdown>
        </Popover>

        <Popover // volume
          opened={volumePopoverOpened} 
          onChange={setVolumePopoverOpened}
          position="top"
          withArrow
        >
          <Popover.Target>
            <ActionIcon 
              variant="subtle" 
              onClick={() => setVolumePopoverOpened((o) => !o)}
              title={`Volume: ${Math.round(volume * 100)}%`}
            >
              {volume === 0 ? <IconVolumeOff size={18} /> : <IconVolume size={18} />}
            </ActionIcon>
          </Popover.Target>
          <Popover.Dropdown>
            <Box style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', width: 20 }}>
              <Text size="xs" fw={500}>{Math.round(volume * 100)}%</Text>
              <div style={{ width: 16, height: 100, position: 'relative' }}>
                <div // https://mantine.dev/hooks/use-move/#vertical-slider
                  ref={volumeRef}
                  style={{
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'var(--mantine-color-gray-2)',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    borderRadius: 4,
                    cursor: 'pointer',
                  }}
                >
                  {/* Filled bar */}
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      height: `${volume * 100}%`,
                      width: '100%',
                      backgroundColor: 'var(--mantine-color-blue-filled)',
                      borderRadius: 4,
                    }}
                  />
                </div>
                {/* Thumb */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: `calc(${volume * 100}% - 8px)`,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 16,
                    height: 16,
                    backgroundColor: 'var(--mantine-color-blue-7)',
                    borderRadius: '50%',
                    zIndex: 1,
                    pointerEvents: 'none',
                  }}
                />
              </div>
            </Box>
          </Popover.Dropdown>
        </Popover>
      </Group>
    </Group>
  );
}