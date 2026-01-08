import { AppShell } from "@mantine/core";
import HeaderMenuBar from "./HeaderMenuBar";
import MainColumn from "./MainColumn";

export default function AppFrame() {
    return (
        <AppShell
            header={{ height: 44 }}
            padding="md"
            styles={{
                header: {
                    backgroundColor: "#f1f3f5",   // light grey
                    borderBottom: "1px solid #dee2e6",
                },
                main: {
                    height: "calc(100vh - 44px)",
                },
            }}
        >
            <AppShell.Header>
                <HeaderMenuBar />
            </AppShell.Header>

            <AppShell.Main>
                <MainColumn />
            </AppShell.Main>
        </AppShell>
    );
}
