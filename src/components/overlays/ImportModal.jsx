import { useState } from 'react';
import { Modal, Button, Group, SegmentedControl, Text, Stack } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useVideo } from '../../contexts/VideoContext';

export default function ImportModal({ opened, onClose }) {
  const { loadVideo } = useVideo();
  const [selectedResolution, setSelectedResolution] = useState('high'); // default high res
  const [isLoading, setIsLoading] = useState(false); // TODO lock UI during loading

  const handleSelectVideo = async () => {
    try {
      setIsLoading(true);
      const filePath = await window.electronAPI.selectVideo();

      if (!filePath) {
        return; // user cancelled
      }

      // verify it's an mp4
      // TODO add other acceptable file paths
      if (!filePath.endsWith('.mp4')) {
        notifications.show({
          title: 'Invalid file',
          message: 'Selected file must be an .mp4',
          color: 'red',
        });
        return;
      }

      await loadVideo(filePath, selectedResolution);

      notifications.show({
        title: 'Video loaded',
        message: 'Video imported successfully',
        color: 'green',
      });

      onClose();

    } catch (err) {
      notifications.show({
        title: 'Import failed',
        message: err.message || 'Failed to load video',
        color: 'red',
      });

      console.error('Import error:', err);

    } finally {
      setIsLoading(false); // unlock UI after loading
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Import Video"
      centered
      size="sm"
    >
      <Stack gap="md">
        <div>
          <Text size="sm" fw={500} mb="xs">
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
          </Text>
        </div>

        <Group justify="flex-end">
          <Button variant="subtle" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSelectVideo} loading={isLoading}>
            Select Video
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
