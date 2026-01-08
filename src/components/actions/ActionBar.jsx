import { Paper, Group, Button } from "@mantine/core";

export default function ActionBar() {
    const handleMarkPOI = () => console.log("Mark POI clicked"); // placeholder handlers
    const handleQuickPOI = () => console.log("Quick POI clicked");
    const handleExportGraph = () => console.log("Export Graph clicked");
    const handleHighlightReel = () => console.log("Highlight Reel clicked");

    return (
        <Paper radius="md" p="sm" style={{ height: "100%" }}>
            <Group justify="center" gap="md" h="100%">
                <Button onClick={handleMarkPOI}>Mark POI</Button>
                <Button onClick={handleQuickPOI}>Quick POI</Button>
                <Button onClick={handleExportGraph}>Export Graph</Button>
                <Button onClick={handleHighlightReel}>Highlight Reel</Button>
            </Group>
        </Paper>
    );
}
