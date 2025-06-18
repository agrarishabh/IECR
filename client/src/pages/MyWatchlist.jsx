import React from 'react'
import { dummyMoviesData } from '../assets/assets'
import MovieCard from '../components/MovieCard'
import { dummyWebseriesData } from '../assets/assets'
import BlurCircle from '../components/BlurCircle'
import WebseriesCard from '../components/WebseriesCard'

const MyWatchlist = () => {
  return (
    <div className='relative my-40 mb-60 px-6 md:px-16 lg:px-40 xl:px-44 overflow-hidden min-h-[80vh]'>
      <BlurCircle top="150px" left="0px"/>
      <BlurCircle bottom="50px" right="50px"/>
      <h1 className='text-lg font-medium my-4'>My Watchlist</h1>
      <div className='flex flex-wrap max-sm:justify-center gap-8'>
        {dummyMoviesData.slice(0,1).map((movie)=> (<MovieCard movie={movie} key={movie._id}/>))}
        {dummyWebseriesData.slice(0,1).map((webseries)=> (<WebseriesCard webseries={webseries} key={webseries._id}/>
        ))}
      </div>
    </div>
  )
}
export default MyWatchlist