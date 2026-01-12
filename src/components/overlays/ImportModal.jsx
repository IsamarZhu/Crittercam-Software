import { useState } from 'react';
import { Modal, Button, Group, SegmentedControl, Text, Stack } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useVideo } from '../../contexts/VideoContext';

export default function ImportModal({ opened, onClose }) {
  const { loadVideoFolder } = useVideo();
  const [selectedResolution, setSelectedResolution] = useState('high'); // default high res
  const [isLoading, setIsLoading] = useState(false); // TODO lock UI during loading

  const handleSelectFolder = async () => {
    try {
      setIsLoading(true);
      const folderData = await window.electronAPI.selectVideoFolder();

      if (!folderData) {
        return; // user cancelled
      }

      await loadVideoFolder(folderData, selectedResolution);

      notifications.show({
        title: 'Folder imported',
        message: 'Videos loaded successfully',
        color: 'green',
      });

      onClose();

    } catch (err) {
      notifications.show({
        title: 'Import failed',
        message: err.message || 'Failed to load videos',
        color: 'red',
      });

      console.error('Folder import error:', err);

    } finally {
      setIsLoading(false); // unlock UI after loading
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Import Videos"
      centered
      size="sm"
    >
      <Stack gap="md">
        {/* <Text size="sm" fw={500} mb="xs"> // TODO resolution selection
            Select video resolution: 
          </Text>
          <SegmentedControl
            value={selectedResolution}
            onChange={setSelectedResolution}
            data={[ // TODO actually change the resolution
              { label: 'Low Resolution', value: 'low' },
              { label: 'High Resolution', value: 'high' },
            ]}
            fullWidth
          />
          <Text size="xs" c="dimmed" mt="xs">
            {selectedResolution === 'low'
              ? 'Low res explanation low res explanation'
              : 'High res explanation high res explanation'}
          </Text> */}
        <Text size="sm" c="dimmed">
          Folder import expects names like Day1Whale1_YYYYMMDD_HHMMSS with a "video" subfolder.
        </Text>

        <Group justify="flex-end">
          <Button variant="subtle" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSelectFolder} loading={isLoading}>
            Select Folder
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
