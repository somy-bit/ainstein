
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Check for API_KEY and set it if it's part of a build process or known mechanism.
// For this environment, we assume process.env.API_KEY is populated externally.
// Example: Dynamically load from a config if not using Node's process.env directly in browser
// This is a placeholder as direct process.env access in browser bundle is tricky without build tools.
// For the purpose of this exercise, we'll rely on the GeminiService check.
// if (typeof process === 'undefined') {
//   // @ts-ignore
//   globalThis.process = { env: { API_KEY: "YOUR_API_KEY_IF_NOT_SET_VIA_ENV_VAR" } }; 
// }


const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);