import '@mantine/core/styles.css';
import { MantineProvider } from '@mantine/core';

import { createRoot } from 'react-dom/client';

// render full app frame
const App = () => {
  return (
      <h1>Hello, Electron with React!</h1>
  );
}

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<MantineProvider><App /></MantineProvider>);