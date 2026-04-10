import React from 'react'

const HeroSection = () => {
  return (
    <div className='relative flex flex-col justify-center gap-4 px-6 md:px-16 lg:px-36 bg-[url("/backgroundimage.png")] bg-cover bg-center'>
  <div className="absolute inset-0 bg-black opacity-70"></div>
  <div className="relative z-10 text-white">
    <h1 className='text-5xl md:text-[70px] md:leading-18 font-semibold max-w-110 pt-50 animate-slide-in-left heading-hover-cyan'>
      Indian <br/> Entertainment <br/> Content <br/> Recommendation
    </h1>
    <p className='text-lg md:text-xl max-w-2xl max-md:pt-3 max-md:pb-60 pb-70 pt-5 animate-text-reveal' style={{ animationDelay: '0.4s' }}>
        Discover top-rated Indian movies and web series, all IMDb ratings 7+ and rated by 20K+ users. Create your watchlist, rate content, and enjoy personalized recommendations—all in one place! 🎬✨
    </p>
  </div>
</div>

  )
}

export default HeroSection