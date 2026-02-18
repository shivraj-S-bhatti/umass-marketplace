import { Routes, Route, Navigate, useSearchParams } from 'react-router-dom'
import { useEffect } from 'react'
import { Toaster } from '@/shared/components/ui/toaster'
import { UserProvider } from '@/shared/contexts/UserContext'
import { ThemeProvider } from '@/shared/contexts/ThemeContext'
import { ListingsViewProvider } from '@/shared/contexts/ListingsViewContext'
import { ChatProvider } from '@/shared/contexts/ChatContext'
import { CartProvider } from '@/shared/contexts/CartContext'
import { LoginModalProvider, useLoginModal } from '@/shared/contexts/LoginModalContext'
import { LoginModal } from '@/shared/components/ui/login-modal'
import ProtectedRoute from '@/shared/components/ProtectedRoute'
import Layout from '@/shared/components/Layout'
import { ErrorBoundary } from '@/shared/components/ErrorBoundary'
import HomePage from '@/features/marketplace/pages/HomePage'
import SellPage from '@/features/marketplace/pages/SellPage'
import DashboardPage from '@/features/marketplace/pages/DashboardPage'
import EditPage from '@/features/marketplace/pages/EditPage'
import MessagesPage from '@/features/marketplace/pages/MessagesPage'
import OAuthSuccessPage from '@/pages/OAuthSuccessPage'
import CartPage from '@/features/marketplace/pages/CartPage'
import SellerProfilePage from '@/features/marketplace/pages/SellerProfilePage'
import SellerShopPage from '@/features/marketplace/pages/SellerShopPage'
import ListingRedirectPage from '@/pages/ListingRedirectPage'
import BentoHomePage from '@/pages/LandingPage'
import DirectoryPage from '@/pages/DirectoryPage'

function LoginRedirect() {
  const { openLoginModal } = useLoginModal()
  useEffect(() => { openLoginModal() }, [openLoginModal])
  return <Navigate to="/" replace />
}

function HomeWithLoginParam() {
  const [searchParams] = useSearchParams()
  const { openLoginModal } = useLoginModal()
  useEffect(() => {
    if (searchParams.get('login') === '1') openLoginModal()
  }, [searchParams, openLoginModal])
  return <BentoHomePage />
}

function App() {
  return (
    <UserProvider>
      <ThemeProvider>
        <LoginModalProvider>
          <ListingsViewProvider>
            <CartProvider>
              <ChatProvider>
                <Layout>
                  <ErrorBoundary>
                    <Routes>
                      <Route path="/" element={<HomeWithLoginParam />} />
                      <Route
                        path="/marketplace"
                        element={
                          <ProtectedRoute>
                            <HomePage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/directory"
                        element={
                          <ProtectedRoute>
                            <DirectoryPage />
                          </ProtectedRoute>
                        }
                      />
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
                      <Route path="/login" element={<LoginRedirect />} />
                      <Route path="/landing" element={<Navigate to="/" replace />} />
                      <Route path="/auth/success" element={<OAuthSuccessPage />} />
                      <Route
                        path="/messages"
                        element={
                          <ProtectedRoute>
                            <MessagesPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route path="/cart" element={<CartPage />} />
                      <Route path="/listing/:id" element={<ListingRedirectPage />} />
                      <Route path="/u/:sellerId" element={<SellerShopPage />} />
                      <Route path="/u/:sellerId/:nameSlug" element={<SellerShopPage />} />
                      <Route path="/profile/:sellerId" element={<SellerProfilePage />} />
                    </Routes>
                  </ErrorBoundary>
                  <LoginModal />
                  <Toaster />
                </Layout>
              </ChatProvider>
            </CartProvider>
          </ListingsViewProvider>
        </LoginModalProvider>
      </ThemeProvider>
    </UserProvider>
  )
}

export default App
