import React from 'react'
import { assets } from '../assets/assets'

const Footer = () => {
  return (
    <footer className="px-6 mt-40 md:px-16 lg:px-36 w-full text-gray-300">
            <div className="flex flex-col md:flex-row justify-between w-full gap-10 border-b border-gray-500 pb-14">
                <div className="md:max-w-96">
                    <img className="w-22 h-10" src={assets.logo} alt="logo" />
                    <p className="mt-6 text-sm">
                        Explore a curated collection of India’s finest movies and web series, each boasting an IMDb rating of 7 or higher and reviewed by over 20,000 viewers. Create your personal watchlist, rate what you love, and enjoy smart, tailored recommendations—everything you need, all in one seamless platform.
                    </p>
                </div>
                <div className="flex-1 flex items-start md:justify-end gap-20 md:gap-40">
                    <div>
                        <h2 className="font-semibold mb-5">IECR</h2>
                        <ul className="text-sm space-y-2">
                            <li><a href="#">Home</a></li>
                            <li><a href="#">About us</a></li>
                            <li><a href="#">Contact us</a></li>
                            <li><a href="#">Privacy policy</a></li>
                        </ul>
                    </div>
                    <div>
                        <h2 className="font-semibold mb-5">Get in touch</h2>
                        <div className="text-sm space-y-2">
                            <p>+91 6389841527</p>
                            <p>agraharirishabh40204@gmail.com</p>
                        </div>
                    </div>
                </div>
            </div>
            <p className="pt-4 text-center text-sm pb-5">
                Copyright {new Date().getFullYear()} © Rishabh Agrahari. All Right Reserved.
            </p>
        </footer>
  )
}

export default Footer