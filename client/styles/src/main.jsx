import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { globalCSS } from '../styles/tokens'

// Menyuntikkan style CSS FolkFund global secara langsung ke dokumen
const styleEl = document.createElement("style");
styleEl.innerHTML = globalCSS;
document.head.appendChild(styleEl);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)