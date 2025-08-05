import React from 'react';
import ReactDOM from 'react-dom/client';
import { KottsterApp } from '@kottster/react';
import '@kottster/react/dist/style.css';

const pageEntries = import.meta.glob('./pages/**/index.{jsx,tsx}', { eager: true });

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <KottsterApp pageEntries={pageEntries} />
  </React.StrictMode>
);