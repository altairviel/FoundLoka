import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { BrowserRouter } from 'react-router-dom';
import './global.css';
import 'leaflet/dist/leaflet.css'; // 👈 TARUH DI SINI AGAR DIMUAT GLOBAL SEJAK AWAL!

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);