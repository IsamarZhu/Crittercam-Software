// bordered box with video + bottom control strip

import { Paper, Box, Text, Group } from "@mantine/core";

export default function VideoSection() {
    return (
        <Paper radius="md" p="md" style={{ height: "100%" }}>
            <Box
                style={{
                    height: "100%",
                    display: "grid",
                    gridTemplateRows: "1fr 44px",
                    gap: 0,
                }}
            >
                {/* Video viewport placeholder */}
                <Box
                    style={{
                        border: "2px dashed #adb5bd",
                        borderRadius: 10,
                        display: "grid",
                        placeItems: "center",
                    }}
                >
                    <Text c="dimmed">Video viewport (placeholder)</Text>
                </Box>

                {/* Video control strip placeholder */}
                <Group
                    justify="space-between"
                    px="sm"
                    style={{
                        height: "100%",
                        alignItems: "center",
                        backgroundColor: "#f1f3f5",     // light gray fill
                        border: "1px solid #dee2e6",
                    }}
                >
                    <Text size="sm" c="dimmed">
                        ▶︎ 00:00 / 60:00
                    </Text>
                    <Text size="sm" c="dimmed">
                        Filename.mp4
                    </Text>
                    <Text size="sm" c="dimmed">
                        🔇 Vol
                    </Text>
                </Group>

            </Box>
        </Paper>
    );
}
