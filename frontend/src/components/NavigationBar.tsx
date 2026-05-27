import React, { useState, useEffect } from 'react';
import { Home, Info, Mail, LogOut, Aperture, Clock, MapPin } from 'lucide-react';

export function NavigationBar() {
  const [time, setTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0'));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className='fixed top-6 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center select-none'>
        {/* Top Main Pill */}
        <nav className='relative bg-[#1e2e36]/30 backdrop-blur-2xl border-[1px] border-white/10 rounded-full px-10 py-3.5 flex items-center gap-12' style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.5), inset 0 1px 2px rgba(255,255,255,0.1)' }}>
            {/* Glow effect under Home */}
            <div className='absolute top-0 left-[2.5rem] w-24 h-full bg-[#00e5ff]/10 rounded-full blur-md pointer-events-none'></div>

            <a href='#home' className='relative flex items-center gap-2 text-[#00e5ff] drop-shadow-[0_0_8px_rgba(0,229,255,0.8)] font-semibold text-lg transition-transform active:scale-95 cursor-pointer'>
                <Home size={22} className='stroke-[2.5px]' />
                <span>Home</span>
                <div className='absolute -bottom-[15px] left-1/2 -translate-x-1/2 w-16 h-[3px] bg-[#00e5ff] shadow-[0_-2px_10px_rgba(0,229,255,1)]'></div>
            </a>

            <a href='#about' className='flex items-center gap-2 text-[#d1d5db] hover:text-white transition-colors font-medium text-lg active:scale-95 cursor-pointer'>
                <Info size={22} />
                <span>About</span>
            </a>

            <a href='#contact' className='flex items-center gap-2 text-[#d1d5db] hover:text-white transition-colors font-medium text-lg active:scale-95 cursor-pointer'>
                <Mail size={22} />
                <span>Contact</span>
            </a>

            <a href='#logout' className='flex items-center gap-2 text-[#d1d5db] hover:text-white transition-colors font-medium text-lg active:scale-95 cursor-pointer'>
                <LogOut size={22} />
                <span>Logout</span>
            </a>
        </nav>

        {/* Bottom Sub Pill */}
        <div className='mt-[-1px] z-[-1] bg-[#142026]/40 backdrop-blur-xl border-x-[1px] border-b-[1px] border-white/5 rounded-b-2xl px-12 py-2 flex items-center gap-8 text-[13px] text-[#9ca3af] font-medium tracking-wider' style={{ boxShadow: '0 10px 24px rgba(0,0,0,0.4)' }}>
            <div className='flex items-center gap-2 hover:text-white cursor-pointer transition-colors'>
                <Aperture size={15} className='text-[#00e5ff]' />
                <span>CityDigitalTwin</span>
            </div>
            
            <div className='w-[1px] h-3.5 bg-white/10'></div>
            
            <div className='flex items-center gap-2'>
                <Clock size={15} />
                <span>{time}</span>
            </div>

            <div className='w-[1px] h-3.5 bg-white/10'></div>

            <div className='flex items-center gap-2'>
                <MapPin size={15} />
                <span>22.4 - 29.38</span>
            </div>
        </div>
    </div>
  );
}
