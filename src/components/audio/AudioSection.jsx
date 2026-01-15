import { useState } from "react";
import {
    Paper,
    Group,
    SegmentedControl,
    Text,
    Box,
    ActionIcon,
    Tooltip,
} from "@mantine/core";
import { IconChevronDown, IconChevronUp } from "@tabler/icons-react";
import AudioDisplay from "./AudioDisplay";

export default function AudioSection({ collapsed, onToggleCollapsed }) {
    const [mode, setMode] = useState("waveform");

    return (
        <Paper
            radius="md"
            p={4}
            style={{
                height: "100%",
                paddingTop: 2,
                paddingBottom: 2,
                position: "relative",
            }}
        >
            <Paper
                withBorder
                p={4}
                radius="md"
                style={{ height: "100%", paddingTop: 2, paddingBottom: 2 }}
            >
                <Box
                    style={{
                        position: "relative",
                        height: "100%",
                        display: "grid",
                        gridTemplateRows: collapsed ? "32px" : "1fr",
                        gap: 2,
                    }}
                >
                    {!collapsed && (
                        mode === "waveform" ? (
                            <AudioDisplay />
                        ) : (
                            <Box
                                style={{
                                    display: "grid",
                                    placeItems: "center",
                                }}
                            >
                                <Text c="dimmed">Spectrogram placeholder</Text>
                            </Box>
                        )
                    )}
                </Box>
            </Paper>

            {/* Controls overlay - segmented control and collapse button */}
            {!collapsed && (
                <Group
                    gap="xs"
                    style={{
                        position: "absolute",
                        top: 7,
                        right: 40,
                        zIndex: 11,
                    }}
                >
                    <SegmentedControl
                        size="xs"
                        value={mode}
                        onChange={setMode}
                        data={[
                            { label: "Waveform", value: "waveform" },
                            { label: "Spectrogram", value: "spectrogram" },
                        ]}
                    />
                </Group>
            )}

            <Tooltip label={collapsed ? "Expand audio panel" : "Collapse audio panel"} withArrow>
                <ActionIcon
                    variant="subtle"
                    onClick={onToggleCollapsed}
                    aria-label={collapsed ? "Expand audio panel" : "Collapse audio panel"}
                    style={{
                        position: "absolute", // use absolute to overlay over paper padding and to prevent arrow shifts when collapsing
                        top: 9,
                        right: 9,
                        zIndex: 10,
                    }}
                >
                    {collapsed ? <IconChevronDown size={18} /> : <IconChevronUp size={18} />}
                </ActionIcon>
            </Tooltip>
        </Paper>
    );
}
