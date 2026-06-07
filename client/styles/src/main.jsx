// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { BrowserRouter } from 'react-router-dom'; // 👈 1. Import ini
import './global.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      {' '}
      {/* 👈 2. Bungkus App di sini */}
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
