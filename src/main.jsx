import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { Analytics } from '@vercel/analytics/react';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Analytics />
    {/* NAYA CODE: GoogleOAuthProvider add kiya gaya hai tera Client ID daal ke */}
    <GoogleOAuthProvider clientId="544441269934-lu0k8ste87fb3j2k1kv4kb21m24070hh.apps.googleusercontent.com">
      <App />
    </GoogleOAuthProvider>
  </StrictMode>,
)
