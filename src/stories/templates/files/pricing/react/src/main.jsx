import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { PricingPage } from './PricingPage.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <PricingPage />
  </StrictMode>,
);
