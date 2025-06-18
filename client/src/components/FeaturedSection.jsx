import { ArrowRight } from 'lucide-react'
import React from 'react'
import { useNavigate } from 'react-router-dom'
import BlurCircle from './BlurCircle'
import MovieCard from './MovieCard'
import { dummyMoviesData, dummyWebseriesData } from '../assets/assets'
import WebseriesCard from './WebseriesCard'


const FeaturedSection = () => {
    const navigate = useNavigate()
  return (
    <div className='px-6 md:px-16 lg:px-24 xl:px-44 overflow-hidden'>
        <div className='relative flex items-center justify-between pt-20 pb-10'>
            <BlurCircle top='0' right='-80px'/>
            <p className='text-gray-300 font-medium text-lg'>Most Rated Indian Movies</p>
            <button onClick={()=>{navigate('/movies'); scrollTo(0,0)}} className='group flex items-center gap-2 text-sm text-gray-300 cursor-pointer'>View All
                <ArrowRight className='group-hover:translate-x-0.5 transition w-4.5 h-4.5'/>
            </button>
        </div>
        <div className='flex flex-wrap max-sm:justify-center gap-8 mt-8'>
            {dummyMoviesData.slice(0,4).map((show)=>(
                <MovieCard key={show._id} movie={show} />
            ))}

        </div>
        <div className='relative flex items-center justify-between pt-20 pb-10'>
            <BlurCircle top='0' left='-160px'/>
            <p className='text-gray-300 font-medium text-lg'>Most Rated Indian Webseries</p>
            <button onClick={()=>{navigate('/webseries'); scrollTo(0,0)}} className='group flex items-center gap-2 text-sm text-gray-300 cursor-pointer'>View All
                <ArrowRight className='group-hover:translate-x-0.5 transition w-4.5 h-4.5'/>
            </button>
        </div>
        <div className='flex flex-wrap max-sm:justify-center gap-8 mt-8'>
            {dummyWebseriesData.slice(0,4).map((show)=>(
                <WebseriesCard key={show._id} webseries={show} />
            ))}

        </div>
    </div>
    
  )
}

export default FeaturedSection