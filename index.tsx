
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Per user request to "clone the app" on every reload, this clears all
// persistent client-side storage to ensure a completely fresh state.
console.log("App 'cloned': Clearing localStorage and sessionStorage on reload.");
localStorage.clear();
sessionStorage.clear();

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
