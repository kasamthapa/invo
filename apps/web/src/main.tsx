import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import { queryClient } from './lib/queryClient'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import AppShell from './components/AppShell'

// Public pages
import PublicBill from './pages/PublicBill'
import PublicCatalog from './pages/PublicCatalog'

// Auth pages
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'

// App pages
import Dashboard from './pages/Dashboard'
import Products from './pages/Products'
import NewBill from './pages/NewBill'
import Customers from './pages/Customers'
import More from './pages/More'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/bill/:token" element={<PublicBill />} />
            <Route path="/shop/:slug" element={<PublicCatalog />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected app routes */}
            <Route
              path="/app"
              element={
                <ProtectedRoute>
                  <AppShell />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="products" element={<Products />} />
              <Route path="bill/new" element={<NewBill />} />
              <Route path="customers" element={<Customers />} />
              <Route path="more" element={<More />} />
            </Route>

            {/* Root redirect */}
            <Route path="/" element={<Navigate to="/app" replace />} />
            <Route path="*" element={<Navigate to="/app" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
)
