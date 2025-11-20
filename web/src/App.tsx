import { Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { UserProvider } from '@/contexts/UserContext'
import { ChatProvider } from '@/contexts/ChatContext' // <-- import ChatProvider
import Layout from '@/components/Layout'
import ProtectedRoute from '@/components/ProtectedRoute'
import HomePage from '@/pages/HomePage'
import SellPage from '@/pages/SellPage'
import DashboardPage from '@/pages/DashboardPage'
import EditPage from '@/pages/EditPage'
import LoginPage from '@/pages/LoginPage'
import MessagesPage from '@/pages/MessagesPage'
import OAuthSuccessPage from '@/pages/OAuthSuccessPage'

// Main App component for UMass Marketplace
// Sets up routing and provides global layout with navigation
function App() {
  return (
    <UserProvider>
      <ChatProvider>  {/* <-- Wrap everything that uses useChat */}
        <div className="min-h-screen bg-background">
          <Layout>
            <Routes>
              <Route path="/" element={<HomePage />} />
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
            </Routes>
          </Layout>
          <Toaster />
        </div>
      </ChatProvider>
    </UserProvider>
  )
}

export default App
