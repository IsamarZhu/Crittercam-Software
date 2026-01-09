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

export default function AudioSection({ collapsed, onToggleCollapsed }) {
    const [mode, setMode] = useState("waveform");

    return (
        <Paper
            radius="md"
            p="xs"
            style={{
                height: "100%",
                paddingBottom: 5,
                position: "relative",
            }}
        >
            <Paper withBorder p="xs" radius="md" style={{ height: "100%" }}>
            <Box
                style={{
                    height: "100%",
                    display: "grid",
                    gridTemplateRows: collapsed ? "32px" : "32px 1fr",
                    gap: 2,
                }}
            >
                {/* toolbar at the top */}
                <Group justify="space-between" align="center">
                    {!collapsed && (
                        <SegmentedControl
                            size="xs"
                            value={mode}
                            onChange={setMode}
                            data={[
                                { label: "Waveform", value: "waveform" },
                                { label: "Spectrogram", value: "spectrogram" },
                            ]}
                        />
                    )}
                    {collapsed && <Box />}
                </Group>

                {!collapsed && ( // display collapses
                    <Box
                        style={{
                            border: "2px dashed #adb5bd",
                            borderRadius: 10,
                            display: "grid",
                            placeItems: "center",
                        }}
                    >
                        <Text c="dimmed">
                            {mode === "waveform" ? "Waveform" : "Spectrogram"} (placeholder)
                        </Text>
                    </Box>
                )}
            </Box>
            </Paper>

            {/* Collapse button overlay */}
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
