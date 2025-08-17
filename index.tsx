// Simple JavaScript entry point for React app
const { createElement } = React;
const { createRoot } = ReactDOM;

// Import App component dynamically
import('./App.tsx').then(({ default: App }) => {
  const container = document.getElementById('root');
  if (container) {
    const root = createRoot(container);
    root.render(createElement(App));
  }
}).catch(console.error);
