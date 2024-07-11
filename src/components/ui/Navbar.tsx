import React from 'react'
import Image from 'next/image'
import { DarkModeToggle } from '../dark-mode-toggle'

const Navbar = () => {
  return (
    <div
    className='pt-[17px] pr-[42px] pb-4 pl-[357px] bg-BackgroundColor flex justify-between items-center' style={{boxShadow: "0px 2px 6px 2px rgba(0, 0, 0, 0.15), 0px 1px 2px 0px rgba(0, 0, 0, 0.30)"}}  
    >
        <div className="chatbot-details flex gap-4 items-center">
            <div className="chat-icon">
              <Image
              src="/chaticon.png"
              alt='icon'
              width={32}
              height={32}
              />
              
              </div>
            <div className="details text-white">
                <div className=' text-2xl font-medium '>ChatBotsss</div>
                <div className='online text-sm font-medium flex items-center gap-1 '>
                  <span className=' block w-2 h-2 bg-green-700 rounded-full' style={{outline: "1px solid #fff"}}></span>
                  online Now</div>
            </div>
        </div>
        <div className="demo  flex items-center gap-4">
            <div className="demo-btn">
              <button className='flex justify-center items-center rounded-xl p-3 text-BackgroundColor bg-btnSecondaryColor text-xl font-medium'>Request Demo</button>
            </div>
            <div className="close">
            <DarkModeToggle />
            </div>
        </div>
    </div>
  )
}

export default Navbar