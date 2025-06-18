import React from 'react'
import { dummyWebseriesData } from '../assets/assets'
import BlurCircle from '../components/BlurCircle'
import WebseriesCard from '../components/WebseriesCard'


const Webseries = () => {
   return dummyWebseriesData.length > 0 ?(
    <div className='relative my-40 mb-60 px-6 md:px-16 lg:px-40 xl:px-44 overflow-hidden min-h-[80vh]'>
      <BlurCircle top="150px" left="0px"/>
      <BlurCircle bottom="50px" right="50px"/>
      <h1 className='text-lg font-medium my-4'>Showing All Webseries</h1>
      <div className='flex flex-wrap max-sm:justify-center gap-8'>
        {dummyWebseriesData.map((show)=> (<WebseriesCard webseries={show} key={show._id}/>
        ))}
      </div>
    </div>
  ) : (
    <div className='flex flex-col items-center justify-center h-screen'>
      <h1 className='text-3xl font-bold text-center'>No webseries available</h1>
    </div>
  )
}

export default Webseries