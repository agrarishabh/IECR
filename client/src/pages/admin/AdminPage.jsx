import React from 'react'
import AdminNavbar from '../../components/admin/AdminNavbar'
import AddMovies from '../../components/admin/AddMovies'
import AddWebseries from '../../components/admin/AddWebseries'
import BlurCircle from '../../components/BlurCircle'

const AdminPage = () => {
  return (
    <>
        <AdminNavbar/>
        <BlurCircle top='0' right='-80px'/>
        <AddMovies/>
        <BlurCircle bottom='0' left='-80px'/>
        <AddWebseries/>
    </>
  )
}

export default AdminPage