import React from 'react'

const AddWebseries = () => {
  return (
        <div>
        <h1 className='text-2xl lg:text-3xl pt-10 pb-2 text-center font-bold'>Add Webseries</h1>
        <form className='mx-20 md:mx-40 lg:mx-60 xl:mx-80 border border-[#37C6CB] rounded-lg p-6 flex flex-col items-center justify-center gap-3 lg:gap-4 mb-4'>
            <label className='lg:text-xl'>Webseries Details : </label>
            <input className='border lg:text-lg px-1 py-1' type="text" placeholder="_id" />
            <input className='border lg:text-lg px-1 py-1' type="number" placeholder="id" />
            <input className='border lg:text-lg px-1 py-1' type="text" placeholder="Webseries Title" />
            <input className='border lg:text-lg px-1 py-1' type="text" placeholder="Poster Link" />
            <input className='border lg:text-lg px-1 py-1' type="number" placeholder="Release Year" />
            <input className='border lg:text-lg px-1 py-1' type="number" placeholder="Seasons" />
            <input className='border lg:text-lg px-1 py-1' type="text" placeholder="Rating" />
            <input className='border lg:text-lg px-1 py-1' type="text" placeholder="Votes" />
            <button className='h-8 w-22 mt-3 lg:h-10 lg:w-24 lg:text-lg bg-[#37C6CB] rounded cursor-pointer' type="submit">Add</button>
        </form>
    </div>
  )
}

export default AddWebseries