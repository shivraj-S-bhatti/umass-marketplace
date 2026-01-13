import { Routes, Route } from 'react-router-dom'
import { Toaster } from '@/shared/components/ui/toaster'
import { UserProvider } from '@/shared/contexts/UserContext'
import { ChatProvider } from '@/shared/contexts/ChatContext'
import { CartProvider } from '@/shared/contexts/CartContext'
import ProtectedRoute from '@/shared/components/ProtectedRoute'
import Layout from '@/shared/components/Layout'
import { ErrorBoundary } from '@/shared/components/ErrorBoundary'
import HomePage from '@/features/marketplace/pages/HomePage'
import SellPage from '@/features/marketplace/pages/SellPage'
import DashboardPage from '@/features/marketplace/pages/DashboardPage'
import EditPage from '@/features/marketplace/pages/EditPage'
import LoginPage from '@/pages/LoginPage'
import MessagesPage from '@/features/marketplace/pages/MessagesPage'
import OAuthSuccessPage from '@/pages/OAuthSuccessPage'
import DesignPlaygroundPage from '@/pages/DesignPlaygroundPage'
import CartPage from '@/features/marketplace/pages/CartPage'
import SellerProfilePage from '@/features/marketplace/pages/SellerProfilePage'
import LandingPage from '@/pages/LandingPage'

// Main App component for Everything UMass
// Sets up routing and provides global layout with navigation
function App() {
  return (
    <UserProvider>
      <CartProvider>
        <ChatProvider>
          <Layout>
            <ErrorBoundary>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/landing" element={<LandingPage />} />
                {/* Future enhancement routes - currently show landing page */}
                <Route path="/events" element={<LandingPage />} />
                <Route path="/common-room" element={<LandingPage />} />
                <Route path="/clubs" element={<LandingPage />} />
                <Route path="/sports" element={<LandingPage />} />
                <Route
                  path="/sell"
                  element={
                    <ProtectedRoute requireSeller>
                      <SellPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute requireSeller>
                      <DashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/edit/:id"
                  element={
                    <ProtectedRoute requireSeller>
                      <EditPage />
                    </ProtectedRoute>
                  }
                />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/auth/success" element={<OAuthSuccessPage />} />
                <Route
                  path="/messages"
                  element={
                    <ProtectedRoute>
                      <MessagesPage />
                    </ProtectedRoute>
                  }
                />
                <Route path="/design-playground" element={<DesignPlaygroundPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/profile/:sellerId" element={<SellerProfilePage />} />
              </Routes>
            </ErrorBoundary>
            <Toaster />
          </Layout>
        </ChatProvider>
      </CartProvider>
    </UserProvider>
  )
}

export default App
