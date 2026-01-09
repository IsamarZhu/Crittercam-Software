// header row with File/Filters/Help

import { Group, Menu, Text, UnstyledButton } from "@mantine/core";

function MenuButton({ label }) {
    return (
        <UnstyledButton style={{ padding: "6px 10px", borderRadius: 6 }}>
            <Text size="sm">{label}</Text>
        </UnstyledButton>
    );
}

export default function HeaderMenuBar({ onImportClick }) {
    return (
        <Group h="100%" px="md" justify="space-between">
            <Group gap="xs">
                <Menu shadow="md" width={220}>
                    <Menu.Target>
                        <div>
                            <MenuButton label="File" />
                        </div>
                    </Menu.Target>
                    <Menu.Dropdown>
                        <Menu.Item onClick={onImportClick}>Import video…</Menu.Item>
                        <Menu.Divider />
                        <Menu.Item>Export graph snapshot…</Menu.Item>
                        <Menu.Item>Export POIs CSV…</Menu.Item>
                    </Menu.Dropdown>
                </Menu>

                <Menu shadow="md" width={220}>
                    <Menu.Target>
                        <div>
                            <MenuButton label="Filters" />
                        </div>
                    </Menu.Target>
                    <Menu.Dropdown>
                        <Menu.Item>Open filter panel…</Menu.Item>
                        <Menu.Item>Clear filters</Menu.Item>
                    </Menu.Dropdown>
                </Menu>

                <Menu shadow="md" width={220}>
                    <Menu.Target>
                        <div>
                            <MenuButton label="Help" />
                        </div>
                    </Menu.Target>
                    <Menu.Dropdown>
                        <Menu.Item>Keyboard shortcuts</Menu.Item>
                        <Menu.Item>About</Menu.Item>
                    </Menu.Dropdown>
                </Menu>
            </Group>

            <Text size="sm" fw={600}>
                Crittercam Tool
            </Text>
        </Group>
    );
}
