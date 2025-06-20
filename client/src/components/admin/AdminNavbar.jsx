import { Link } from 'react-router-dom'
import React from 'react'
import { assets } from '../../assets/assets'


const AdminNavbar = () => {
    const user = {
        firstName: 'Rishabh',
        lastName : 'Agrahari',
        imageUrl : assets.profile,
    }
  return (
    <div>
    <div className='flex items-center justify-between px-6 md:px-10 h-16 border-b border-gray-300/30'>
    <Link to="/">
    <img src={assets.logo} alt="logo" className='w-22 h-10 '/>
    </Link>   
    </div>
    <div>
        <img className='h-20 md:h-30 w-20 md:w-30 rounded-full mx-auto mt-10' src={user.imageUrl} alt=""/>
        <p className=' lg:text-xl text-center mt-2 text-base '>{user.firstName} {user.lastName} (Admin)</p>
    </div>
    </div>
  )
}

export default AdminNavbar