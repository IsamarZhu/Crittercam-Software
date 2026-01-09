import { useState } from "react";
import { AppShell } from "@mantine/core";
import { VideoProvider } from "../../contexts/VideoContext";
import ImportModal from "../overlays/ImportModal";
import HeaderMenuBar from "./HeaderMenuBar";
import MainColumn from "./MainColumn";

export default function AppFrame() {
    const [importModalOpened, setImportModalOpened] = useState(false); // track import modal state across app

    return (
        <AppShell
            header={{ height: 44 }}
            padding="sm"
            styles={{
                header: {
                    backgroundColor: "#f1f3f5",   // light grey
                    borderBottom: "2px solid #dee2e6",
                },
                main: {
                    height: "calc(100vh - 44px)",
                },
            }}
        >
            <AppShell.Header>
                <HeaderMenuBar onImportClick={() => setImportModalOpened(true)} />
            </AppShell.Header>

            <AppShell.Main>
                <VideoProvider> {/* provide video context to main content, don't need to wrap around entire appshell */}
                    <MainColumn />
                    <ImportModal
                        opened={importModalOpened}
                        onClose={() => setImportModalOpened(false)}
                    />
                </VideoProvider>
            </AppShell.Main>
        </AppShell>
    );
}
