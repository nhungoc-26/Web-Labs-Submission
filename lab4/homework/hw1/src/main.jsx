import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import PhotoGalleryLayout from './PhotoGalleryLayout';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PhotoGalleryLayout />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
