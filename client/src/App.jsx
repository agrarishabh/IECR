import React from 'react'
import Navbar from './components/Navbar'
import { Route, Routes, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import Movies from './pages/Movies'
import Webseries from './pages/Webseries'
import MyWatchlist from './pages/MyWatchlist'
import Watched from './pages/Watched'
import { Toaster } from 'react-hot-toast'
import Footer from './components/Footer'
import AdminPage from './pages/admin/AdminPage'

const App = () => {
  const isAdminRoute = useLocation().pathname.startsWith('/admin')
  return (
    <>
    <Toaster/>
    {!isAdminRoute && <Navbar/>}
    <Routes>
      <Route path='/' element ={<Home/>} />
      <Route path='/movies' element = {<Movies/>}/>
      <Route path='/webseries' element = {<Webseries/>}/>
      <Route path='my-watchlist' element ={<MyWatchlist/>}/>
      <Route path='/watched' element = {<Watched/>}/>
      <Route path='/admin' element = {<AdminPage/>}/>
    </Routes>
    {!isAdminRoute && <Footer/>}
    </>
   
  )
}
export default App