import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'
import OneSignal from 'react-onesignal';

// I-initialize ang OneSignal gamit ang imong tinuod nga App ID
OneSignal.init({
  appId: "e74823bb-b357-49a4-9362-d7962360dba3", // ✅ Imong App ID gikan sa OneSignal
  allowLocalhostAsSecureOrigin: true,
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)