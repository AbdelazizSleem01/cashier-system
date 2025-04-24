'use client';

import { Calendar, Clock } from 'lucide-react';
import React, { useEffect, useState } from 'react';

const Footer = () => {
  const [currentTime, setCurrentTime] = useState(null);

  // ⏰ Initialize the clock only on the client side
  useEffect(() => {
    setCurrentTime(new Date()); // Initialize with the current time
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval); // Cleanup interval
  }, []);

  if (!currentTime) {
    return null; // Render nothing until the clock is initialized
  }

  return (
    <footer className="fixed bottom-0 w-full bg-gradient-to-r from-blue-50 to-gray-50 border-t border-gray-500/20 px-6 py-3 text-sm text-gray-600 z-50">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Version & Copyright */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded-full text-xs font-medium">
              نظام الكاشير v {process.env.NEXT_PUBLIC_APP_VERSION}
            </span>
          </div>
        </div>

        <div className="hidden md:block text-gray-500 text-center">
          © {new Date().getFullYear()} جميع الحقوق محفوظة
        </div>

        {/* ⏰ Live Clock + 📅 Date */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full shadow-sm border border-gray-200/50">
            <Clock className='text-blue-700 w-4 h-4' />
            <span className="font-medium text-gray-700">
              {currentTime.toLocaleTimeString('ar-EG', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false,
              })}
            </span>
          </div>

          <div className="hidden md:flex items-center gap-2 bg-white px-3 py-1.5 rounded-full shadow-sm border border-gray-200/50">
            <Calendar className='text-blue-700 w-4 h-4' />
            <span className="font-medium text-gray-700">
              {currentTime.toLocaleDateString('ar-EG', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                weekday: 'long'
              })}
            </span>
          </div>
        </div>

        <div className="md:hidden text-center text-gray-500 text-xs">
          © {new Date().getFullYear()} جميع الحقوق محفوظة
        </div>
      </div>
    </footer>
  );
};

export default Footer;