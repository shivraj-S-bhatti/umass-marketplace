import { Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { UserProvider } from '@/contexts/UserContext'
import Layout from '@/components/Layout'
import HomePage from '@/pages/HomePage'
import SellPage from '@/pages/SellPage'
import DashboardPage from '@/pages/DashboardPage'
import EditPage from '@/pages/EditPage'
import LoginPage from '@/pages/LoginPage'
import DesignPlaygroundPage from '@/pages/DesignPlaygroundPage'
import CartPage from '@/pages/CartPage'

// Main App component for UMass Marketplace
// Sets up routing and provides global layout with navigation
function App() {
  return (
    <UserProvider>
      <div className="min-h-screen bg-background">
        <Layout>
          <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/sell" element={<SellPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/edit/:id" element={<EditPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/design-playground" element={<DesignPlaygroundPage />} />
          <Route path="/cart" element={<CartPage />} />
          </Routes>
        </Layout>
        <Toaster />
      </div>
    </UserProvider>
  )
}

export default App
