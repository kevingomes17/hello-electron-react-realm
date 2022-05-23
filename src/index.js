import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import RealmProvider from './realm-provider';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <RealmProvider>
      <App />
    </RealmProvider>
  </React.StrictMode>
);
