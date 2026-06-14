import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import PublicBill from './pages/PublicBill.tsx'
import PublicCatalog from './pages/PublicCatalog.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/bill/:token" element={<PublicBill />} />
          <Route path="/shop/:slug" element={<PublicCatalog />} />
        <Route path="*" element={<App />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
