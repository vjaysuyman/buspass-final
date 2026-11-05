import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'
import OneSignal from 'react-onesignal';

// ✅ KINI ANG SAKTONG INITIALIZATION
OneSignal.init({
  appId: "e74823bb-b357-49a4-9362-d7962360dba3", 
  allowLocalhostAsSecureOrigin: true,
  serviceWorkerPath: "/OneSignalSDKWorker.js", // ✅ GIDUGANG
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)