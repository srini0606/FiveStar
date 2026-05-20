// src/components/Layout.js
import React, { useEffect } from 'react';
import backgroundImage from '../assets/images/five-star.jpg'; // Make sure the path is correct

const Layout = ({ children }) => {

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      // Cancel the event as specified by the standard.
      event.preventDefault();
      // Chrome requires returnValue to be set.
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Background layer */}
      <div
        className="absolute inset-0 z-0"
        aria-hidden="true"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundAttachment: 'fixed',
          filter: 'blur(10px)' // Adjust the pixel value to increase or decrease the blur intensity
        }}
      ></div>

      {/* Content layer */}
      <div className="relative z-10 flex flex-col flex-grow">
        <header className="bg-primary text-center text-white p-4">
          <h1>Instant Help - Accessible Assistance Anytime, Anywhere</h1>
        </header>

        <main className="flex-grow">
          {children}
        </main>

        <footer className="text-primary p-1 text-xs text-center">
          © {new Date().getFullYear()} Fivestargroups
        </footer>
      </div>
    </div>
  );
};

export default Layout;