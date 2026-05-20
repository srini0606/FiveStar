// src/components/NotFoundPage.js
import React from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import logoImage from '../assets/images/logo.png';

function NotFoundPage() {
  const navigate = useNavigate(); // Create a navigate function using the useNavigate hook

  const handleBackToHome = () => {
    navigate('/'); // Navigate to the home page
  };

  return (
    <div className="flex flex-col items-center justify-center flex-1 py-3" style={{ minHeight: 'calc(100vh - 120px)' }}>
      <div className="w-full max-w-md p-8 mx-auto mt-10 bg-white shadow-lg rounded-lg">
        <img src={logoImage} alt="Five Star Company Logo" className="mx-auto h-12 w-auto" />
        <div className="text-gray-800 text-center py-8">
          <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-secondary mx-auto">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 16.318A4.486 4.486 0 0 0 12.016 15a4.486 4.486 0 0 0-3.198 1.318M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Z" />
          </svg>
          <h1 className="text-xl font-semibold mt-4">Oops! Page not found.</h1>
          <p className="text-md mt-2 mb-4">We can't seem to find the page you're looking for.</p>
          <div className="flex items-center justify-center gap-5 m-10">
            <button
              onClick={handleBackToHome} // Add onClick event handler
              type="button"
              className="border-secondary hover:bg-secondary hover:text-white text-secondary w-[200px] flex justify-center py-2 px-4 border rounded-md shadow-sm text-sm font-medium cursor-pointer"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NotFoundPage;