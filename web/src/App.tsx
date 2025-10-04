import { Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import Layout from '@/components/Layout'
import HomePage from '@/pages/HomePage'
import SellPage from '@/pages/SellPage'
import DashboardPage from '@/pages/DashboardPage'
import LoginPage from '@/pages/LoginPage'

// Main App component for UMass Marketplace
// Sets up routing and provides global layout with navigation
function App() {
  return (
    <div className="min-h-screen bg-background">
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/sell" element={<SellPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </Layout>
      <Toaster />
    </div>
  )
}

export default App
