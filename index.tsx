
import React from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// Safely retrieve Client ID from environment variables with a hard fallback
const clientId = (typeof process !== 'undefined' ? process.env.VITE_GOOGLE_CLIENT_ID : null) 
  || "844389175436-flr9gltj1fami94bccill1us3phdla3q.apps.googleusercontent.com";

const root = createRoot(rootElement);
root.render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={clientId}>
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>
);
