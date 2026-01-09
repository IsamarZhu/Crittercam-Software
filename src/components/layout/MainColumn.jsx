// vertical stack of main content area

import { useState } from "react";
import { Box } from "@mantine/core";
import VideoSection from "../video/VideoSection";
import AudioSection from "../audio/AudioSection";
import TimelineSection from "../timeline/TimelineSection";
import ActionBar from "../actions/ActionBar";

export default function MainColumn() {

    // state for audio panel collapsed, lifted
    const [audioCollapsed, setAudioCollapsed] = useState(false);

    return (
        <Box
            style={{
                height: "100%",
                display: "grid",
                gridTemplateRows: audioCollapsed ? "50% 30px 1fr 50px" : "50% 15% 1fr 50px",
                gap: 0,
            }}
        >
            <VideoSection />
            <AudioSection
                collapsed={audioCollapsed}
                onToggleCollapsed={() => setAudioCollapsed((c) => !c)}
            />
            <TimelineSection />
            <ActionBar />
        </Box>
    );
}
