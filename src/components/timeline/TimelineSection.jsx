// graph + video-present bar + filter highlights + cursor line

import { useState } from "react";
import { Paper, Box, Text, Slider } from "@mantine/core";

export default function TimelineSection() {
    const [t, setT] = useState(0);

    return (
        <Paper radius="md" p="xs" style={{ height: "100%", paddingBottom: 2 }}>
            <Box
                style={{
                    height: "100%",
                    display: "grid",
                    gridTemplateRows: "1fr auto",
                    gap: 2,
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
                    {/* Vertical cursor line placeholder */}
                    <Box
                        style={{
                            position: "absolute",
                            top: 0,
                            bottom: 0,
                            left: `${t}%`,
                            width: 2,
                            background: "rgba(255,0,0,0.6)",
                        }}
                    />
                    <Box style={{ height: "100%", display: "grid", placeItems: "center" }}>
                        <Text c="dimmed">Sensor graph (placeholder)</Text>
                    </Box>

                    {/* video present bar placeholder at bottom */}
                    <Box
                        style={{
                            position: "absolute",
                            left: 12,
                            right: 12,
                            bottom: 10,
                            height: 8,
                            borderRadius: 999,
                            background: "#e9ecef",
                            overflow: "hidden",
                        }}
                    >
                        <Box style={{ width: "35%", height: "100%", background: "#fa5252" }} />
                    </Box>
                </Box>

                {/* Time scrub slider */}
                <Box style={{ padding: "0 0px" }}>
                    <Slider
                        value={t}
                        onChange={setT}
                        label={(val) => `${val}%`}
                    />
                </Box>
            </Box>
        </Paper>
    );
}
