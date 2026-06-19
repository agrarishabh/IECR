import React, { lazy, Suspense } from 'react'
import Navbar from './components/Navbar'
import { Route, Routes, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Footer from './components/Footer'
import AdminRoute from './context/AdminRoute'
import { SocketProvider } from './context/SocketContext'
import { AnimatePresence } from 'framer-motion'
import PageTransition from './components/PageTransition'
import { Helmet } from 'react-helmet-async'

const Home = lazy(() => import('./pages/Home'))
const Movies = lazy(() => import('./pages/Movies'))
const Webseries = lazy(() => import('./pages/Webseries'))
const MyWatchlist = lazy(() => import('./pages/MyWatchlist'))
const MyRatings = lazy(() => import('./pages/MyRatings'))
const ProfileHub = lazy(() => import('./pages/ProfileHub'))
const NotFound = lazy(() => import('./pages/NotFound'))
const AdminPage = lazy(() => import('./pages/admin/AdminPage'))

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
    <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

const App = () => {
  const location = useLocation()
  const isAdminRoute = location.pathname.startsWith('/admin')

  return (
    <>
      <Helmet>
        <title>Indian Entertainment | IECR</title>
      </Helmet>
      <Toaster />
      <SocketProvider>
        {!isAdminRoute && <Navbar />}
        <Suspense fallback={<LoadingFallback />}>
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path='/' element={<PageTransition><Home /></PageTransition>} />
              <Route path='/movies' element={<PageTransition><Helmet><title>Movies | IECR</title></Helmet><Movies /></PageTransition>} />
              <Route path='/webseries' element={<PageTransition><Helmet><title>Webseries | IECR</title></Helmet><Webseries /></PageTransition>} />
              <Route path='/my-watchlist' element={<PageTransition><Helmet><title>My Watchlist | IECR</title></Helmet><MyWatchlist /></PageTransition>} />
              <Route path='/my-ratings' element={<PageTransition><Helmet><title>My Ratings | IECR</title></Helmet><MyRatings /></PageTransition>} />
              <Route path='/social' element={<PageTransition><Helmet><title>Social Hub | IECR</title></Helmet><ProfileHub /></PageTransition>} />
              <Route
                path='/admin'
                element={
                  <AdminRoute>
                    <PageTransition><Helmet><title>Admin | IECR</title></Helmet><AdminPage /></PageTransition>
                  </AdminRoute>
                }
              />
              <Route path='*' element={<PageTransition><NotFound /></PageTransition>} />
            </Routes>
          </AnimatePresence>
        </Suspense>
        {!isAdminRoute && <Footer />}
      </SocketProvider>
    </>
  )
}

export default App
