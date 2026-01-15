import { useEffect, useRef, useState } from 'react';
import { Box, Text, Loader, Center } from '@mantine/core';
import WaveSurfer from 'wavesurfer.js';
import { useVideo } from '../../contexts/VideoContext';

// waveform/spectrogram display component
// indexedDB setup for peaks storage
// compute peaks data then load like https://github.com/katspaugh/wavesurfer.js/issues/2058#issuecomment-761284236

const DB_NAME = 'CrittercamDB';
const STORE_NAME = 'waveformPeaks';

const initDB = () => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, 1);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'videoPath' });
            }
        };
    });
};

const getPeaksFromDB = async (videoPath) => {
    try {
        const db = await initDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.get(videoPath);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result?.peaks || null);
        });
    } catch {
        return null;
    }
};

// store peaks data in indexedDB to speed up future loads
const savePeaksToDB = async (videoPath, peaks) => {
    try {
        const db = await initDB();
        return new Promise((resolve) => {
            const transaction = db.transaction(STORE_NAME, 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.put({ videoPath, peaks, timestamp: Date.now() });

            request.onerror = () => resolve(false);
            request.onsuccess = () => resolve(true);
        });
    } catch {
        return false;
    }
};

export default function AudioDisplay() {
    const waveformRef = useRef(null);
    const containerRef = useRef(null);
    const wavesurferRef = useRef(null);
    const isSeekingRef = useRef(false);
    const isMountedRef = useRef(true); // prevent state updates when component unmounted
    const abortControllerRef = useRef(null);
    const [zoom, setZoom] = useState(1);
    const [isReady, setIsReady] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const {
        activeVideo,
        currentRelativeTime,
        setRelativeTime,
    } = useVideo();

    // track component mount status
    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    // initialize wavesurfer when activeVideo changes
    useEffect(() => {
        if (!waveformRef.current) return;

        // abort any pending loads to avoid unnecessary fetch requests
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        // clean up previous instance before creating new one
        if (wavesurferRef.current) {
            try {
                wavesurferRef.current.destroy();
            } catch {
                // ignore errors during cleanup
            }
            wavesurferRef.current = null;
        }

        setIsReady(false);
        setIsLoading(true);
        setZoom(1);

        // only create waveform if there's an active video
        if (!activeVideo) {
            setIsLoading(false);
            return;
        }

        const videoUrl = activeVideo?.fileUrl || (activeVideo?.path ? `file://${activeVideo.path}` : null);
        if (!videoUrl) {
            setIsLoading(false);
            return;
        }

        // create new abort controller for this load
        abortControllerRef.current = new AbortController();

        const ws = WaveSurfer.create({
            container: waveformRef.current,
            waveColor: '#747b84ff',
            progressColor: '#228be6',
            cursorColor: '#fa5252',
            height: 60,
            normalize: true,
            interact: true,
            minPxPerSec: 1,
            fetchParams: {
                signal: abortControllerRef.current.signal,
            },
            hideScrollbar: false,
        });

        let isDestroyed = false;

        // try to load peaks from IndexedDB
        getPeaksFromDB(videoUrl)
            .then((cachedPeaks) => {
                if (isDestroyed) return;

                if (cachedPeaks && cachedPeaks.length > 0) {
                    // load from cached peaks
                    console.log("loading waveform from cached peaks")
                    try {
                        ws.load(videoUrl, cachedPeaks);
                        setIsLoading(false);
                        setIsReady(true);
                        ws.setTime(currentRelativeTime);
                    } catch {
                        // fall back to loading without peaks
                        console.log("failed to load from cached peaks, loading normally")
                        ws.load(videoUrl);
                    }
                } else {
                    // no cache, load normally
                    ws.load(videoUrl);
                }
            })
            .catch(() => {
                // if DB lookup fails, just load normally
                console.log("db lookup failed")
                if (!isDestroyed) {
                    ws.load(videoUrl);
                }
            });

        // handle seek interactions
        ws.on('interaction', () => {
            if (isDestroyed) return;
            isSeekingRef.current = true;
            const newTime = ws.getCurrentTime();
            setRelativeTime(newTime);
            setTimeout(() => {
                isSeekingRef.current = false;
            }, 100);
        });

        // handle ready event
        ws.on('ready', () => {
            if (isDestroyed) return;
            setIsLoading(false);
            setIsReady(true);
            // sync initial position
            ws.setTime(currentRelativeTime);

            // save peaks to indexDB for future use
            try {
                const peaks = ws.getDecodedData();
                if (peaks && peaks.length > 0) {
                    savePeaksToDB(videoUrl, peaks).catch(() => {
                        // fail silently if caching fails
                        console.log("failed to save peaks to db");
                        // TODO clear old entires?
                    });
                }
            } catch {
                // fail silently if getting decoded data fails
            }
        });

        // handle errors, suppress abort errors so console isn't spammed
        ws.on('error', (err) => {
            if (err?.name === 'AbortError') {
                // silently ignore abort errors
                return;
            }
            if (!isDestroyed) {
                console.error('WaveSurfer error:', err);
                setIsLoading(false);
            }
        });

        wavesurferRef.current = ws;

        return () => {
            isDestroyed = true;
            // abort pending load when effect cleanup runs
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, [activeVideo]);

    // sync waveform position with video time
    useEffect(() => {
        if (wavesurferRef.current && !isSeekingRef.current && isReady) {
            const currentWsTime = wavesurferRef.current.getCurrentTime();

            if (Math.abs(currentWsTime - currentRelativeTime) > 0.1) {
                wavesurferRef.current.setTime(currentRelativeTime);
            }
        }
    }, [currentRelativeTime, isReady]);

    // handle wheel zoom using wheel event listener
    useEffect(() => {
        const container = containerRef.current;
        if (!container || !isReady) return;

        const handleWheel = (e) => {
            if (!wavesurferRef.current) return;

            // calculate zoom delta
            const delta = e.deltaY > 0 ? -10 : 10;
            const newZoom = Math.max(1, Math.min(500, zoom + delta));

            setZoom(newZoom);
            wavesurferRef.current.zoom(newZoom);
        };

        container.addEventListener('wheel', handleWheel, { passive: false });

        return () => {
            container.removeEventListener('wheel', handleWheel);
        };
    }, [zoom, isReady]);

    if (!activeVideo) {
        return (
            <Box
                style={{
                    height: '100%',
                    border: '2px dashed #adb5bd',
                    borderRadius: 10,
                    display: 'grid',
                    placeItems: 'center',
                }}
            >
                <Text c="dimmed">No video loaded</Text>
            </Box>
        );
    }

    return (
        <Box
            ref={containerRef}
            style={{
                height: '100%',
                borderRadius: 10,
                backgroundColor: '#fff',
                overflowX: 'scroll',
                overflowY: 'hidden',
                cursor: 'pointer',
                position: 'relative',
            }}
        >
            {isLoading && ( // loading gif
                <Center
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        zIndex: 10,
                    }}
                >
                    <Loader />
                </Center>
            )}
            <div
                ref={waveformRef}
                style={{ width: '100%', paddingTop: 4, boxSizing: 'border-box' }}
            />
        </Box>
    );
}

