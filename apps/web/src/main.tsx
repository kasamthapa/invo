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
import ProductForm from './pages/ProductForm'
import NewBill from './pages/NewBill'
import Bills from './pages/Bills'
import BillDetail from './pages/BillDetail'
import Customers from './pages/Customers'
import CustomerDetail from './pages/CustomerDetail'
import Suppliers from './pages/Suppliers'
import Purchases from './pages/Purchases'
import NewPurchase from './pages/NewPurchase'
import Expenses from './pages/Expenses'
import Settings from './pages/Settings'
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
              <Route path="products/new" element={<ProductForm />} />
              <Route path="products/:id" element={<ProductDetail />} />
              <Route path="products/:id/edit" element={<ProductForm />} />
              <Route path="bill/new" element={<NewBill />} />
              <Route path="bills" element={<Bills />} />
              <Route path="bills/:id" element={<BillDetail />} />
              <Route path="customers" element={<Customers />} />
              <Route path="customers/:id" element={<CustomerDetail />} />
              <Route path="suppliers" element={<Suppliers />} />
              <Route path="purchases" element={<Purchases />} />
              <Route path="purchases/new" element={<NewPurchase />} />
              <Route path="expenses" element={<Expenses />} />
              <Route path="settings" element={<Settings />} />
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
