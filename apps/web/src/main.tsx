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
import ProductDetail from './pages/ProductDetail'
import NewBill from './pages/NewBill'
import Customers from './pages/Customers'
import More from './pages/More'

function ProductFormPlaceholder() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 px-6 text-center">
      <p className="text-zinc-400 text-sm">Add product form coming soon.</p>
      <a href="/app/products" className="text-emerald-400 text-sm font-medium">
        ← Back to products
      </a>
    </div>
  )
}

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
              <Route path="products/new" element={<ProductFormPlaceholder />} />
              <Route path="products/:id" element={<ProductDetail />} />
              <Route path="products/:id/edit" element={<ProductFormPlaceholder />} />
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
