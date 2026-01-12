// bordered box with video + bottom control strip

import { Paper, Box } from "@mantine/core";
import VideoViewport from "./VideoViewport";
import VideoControlStrip from "./VideoControlStrip";

export default function VideoSection() {
    return (
        <Paper radius="md" p="md" style={{ height: "100%", overflow: "hidden" }}>
            <Box
                style={{
                    height: "100%",
                    display: "grid",
                    gridTemplateRows: "1fr auto",
                    gap: 0,
                }}
            >
                <VideoViewport />
                <VideoControlStrip />
            </Box>
        </Paper>
    );
}
