// graph + video-present bar + filter highlights + cursor line

import { Paper, Box, Text, Slider } from "@mantine/core";
import { useVideo } from "../../contexts/VideoContext";

function formatAbsoluteTime(timestampMs) {

    if (!timestampMs || Number.isNaN(timestampMs)) {
        console.warn("invalid timestamp when formatting:", timestampMs);
        return "";
    }

    const date = new Date(timestampMs);
    return date.toLocaleString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });
}

export default function TimelineSection() {
    const {
        videos,
        globalStartMs,
        globalEndMs,
        globalDurationSec,
        globalOffsetSec,
        setGlobalTime,
    } = useVideo();

    const hasTimeline = globalStartMs !== null && globalDurationSec > 0;

    // percentage of current position time / total timeline duration
    const cursorPercent = hasTimeline && globalDurationSec > 0
        ? (globalOffsetSec / globalDurationSec) * 100
        : 0;

    const segments = hasTimeline
        ? videos.map((vid) => {
            // where the video segment starts relative to global timeline
            const startPct = ((vid.startMs - globalStartMs) / (globalEndMs - globalStartMs)) * 100;
            // how long vid segment is
            const widthPct = ((vid.endMs - vid.startMs) / (globalEndMs - globalStartMs)) * 100;
            return { id: vid.id, startPct, widthPct };
        })
        : [];

    return (
        <Paper radius="md" p="xs" style={{ height: "100%", paddingBottom: 2 }}>
            <Box
                style={{
                    height: "100%",
                    display: "grid",
                    gridTemplateRows: "1fr auto auto",
                    gap: 8,
                }}
            >
                {/* Graph placeholder */}
                <Box
                    style={{
                        border: "2px dashed #adb5bd",
                        borderRadius: 10,
                        position: "relative",
                        overflow: "hidden",
                    }}
                >
                    {/* Vertical cursor line */}
                    <Box
                        style={{
                            position: "absolute",
                            top: 0,
                            bottom: 0,
                            left: `${cursorPercent}%`,
                            width: 2,
                            background: "rgba(255,0,0,0.6)",
                        }}
                    />
                    <Box style={{ height: "100%", display: "grid", placeItems: "center" }}>
                        <Text c="dimmed">Sensor graph (placeholder)</Text>
                    </Box>
                </Box>

                {/* video present bar, same length as slider*/}
                <Box
                    style={{
                        height: 10,
                        borderRadius: 999,
                        background: "#e9ecef",
                        position: "relative",
                        overflow: "hidden",
                    }}
                >
                    {segments.map((seg) => (
                        <Box
                            key={seg.id}
                            style={{
                                position: "absolute",
                                left: `${seg.startPct}%`,
                                width: `${seg.widthPct}%`,
                                height: "100%",
                                background: "#fa5252",
                            }}
                        />
                    ))}
                </Box>

                {/* Time scrub slider */}
                <Box style={{ padding: "0 0px" }}>
                    {hasTimeline ? (
                        <Slider
                            value={globalOffsetSec}
                            onChange={(val) => setGlobalTime(globalStartMs + val * 1000)}
                            max={globalDurationSec}
                            min={0}
                            step={0.1} // TODO step size ok?
                            label={(val) => formatAbsoluteTime(globalStartMs + val * 1000)}
                        />
                    ) : (
                        <Text size="sm" c="dimmed" ta="center">
                            Import a folder to see timeline
                        </Text>
                    )}
                </Box>
            </Box>
        </Paper>
    );
}
