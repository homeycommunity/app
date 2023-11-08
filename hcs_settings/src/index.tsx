import { Providers } from '@/Providers';
import { Toaster } from '@/components/ui/toaster';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './app/globals.css';
const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);
root.render(
    <React.StrictMode>
        <Providers>
            <App />
            <Toaster />
        </Providers>
    </React.StrictMode>
);