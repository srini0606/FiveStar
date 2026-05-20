// src/components/MobileSelectionScreen.js
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useLocation } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import logoImage from '../assets/images/logo.png';
import { useAuth } from '../contexts/AuthContext';
import CryptoJS from 'crypto-js';

const SECRET_KEY = "my32characterlongsupersecretkey!";
const IV_STRING = "mycharinitvector";

function MobileSelectionScreen() {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    mode: 'all',
  });
  const navigate = useNavigate();
  const location = useLocation();
  const { setMobileSelected } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { mobileNumbers, loanNumber, customerName, flow } = location.state;

  const onSubmit = async data => {
    setIsSubmitting(true);
    const apiUrl = `${process.env.REACT_APP_API_HOST}/api/cms/sendOTP`; // Assuming you've set REACT_APP_API_URL in your .env
    const headers = {
      "Content-Type": "application/json",
      "x-client-type": "web"
    };
    const body = JSON.stringify({ mobile_number: data.mobileNumber });

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: headers,
        body: body
      });
      const responseData = await response.json();

      if (response.ok && responseData.status.code === 200) {
        setMobileSelected(true);
        navigate(`/verify-otp`, {
          state: {
            flow: flow,
            loanNumber: loanNumber,
            customerName: customerName,
            mobileNumber: data.mobileNumber
          }
        });
      } else {
        toast.error(responseData.status.message || "Failed to send OTP. Please try again.");
      }
    } catch (error) {
      console.error("Error sending OTP:", error);
      toast.error("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const maskMobileNumber = (number) => {
    return number.slice(0, -4).replace(/\d/g, 'x') + number.slice(-4);
  };

  const encryptMobileNumber = (number) => {
  const key = CryptoJS.enc.Utf8.parse(SECRET_KEY);
  const iv = CryptoJS.enc.Utf8.parse(IV_STRING);

  const encrypted = CryptoJS.AES.encrypt(number, key, {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  });

  return encrypted.toString();
  };

  return (
    <div className="flex flex-col items-center justify-center flex-1 py-3" style={{ minHeight: 'calc(100vh - 120px)' }}>
      <div className="w-full max-w-md p-8 mx-auto mt-10 bg-white shadow-lg rounded-lg">
        <ToastContainer
          position="top-center"
          autoClose={5000}
          hideProgressBar
        />
        <div className="mb-6">
          <img src={logoImage} alt="Five Star Company Logo" className="mx-auto h-12 w-auto" />
        </div>
        <h2 className="text-lg font-semibold text-center text-gray-700 py-4">Verify Your Identity</h2>
        <div className="space-y-3 mb-5">
          {/* Conditionally render Loan Number if it exists */}
          {loanNumber && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Loan Number</label>
              <input
                type="text"
                value={loanNumber}
                readOnly
                className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm focus:outline-none sm:text-sm"
              />
            </div>
          )}
          {/* Conditionally render Customer Name if it exists */}
          {customerName && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Customer Name</label>
              <input
                type="text"
                value={customerName}
                readOnly
                className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm focus:outline-none sm:text-sm"
              />
            </div>
          )}
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 px-4">
          <fieldset>
            <legend className="text-sm font-medium text-gray-700">Select a Mobile Number:</legend>
            {mobileNumbers.map((mobile, index) => (
              <div key={index} className="mt-2 flex items-center">
                <input
                  {...register("mobileNumber", { required: "Please select a mobile number." })}
                  type="radio"
                  value={encryptMobileNumber(mobile)}
                  id={`mobile${index}`}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                />
                <label htmlFor={`mobile${index}`} className="ml-3 text-sm text-gray-600">{maskMobileNumber(mobile)}</label>
              </div>
            ))}
            {errors.mobileNumber && (
              <p className="text-red-500 text-xs italic">{errors.mobileNumber.message}</p>
            )}
          </fieldset>
          <button
            type="submit"
            className={isSubmitting ? "mt-4 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-secondary hover:bg-secondary-light" : "mt-4 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-secondary bg-secondary-light"}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <div role="status" className='flex items-center gap-8'>
                <span className="">Sending...</span>
                <svg aria-hidden="true" className="w-4 h-4 text-gray-200 animate-spin dark:text-gray-600 fill-red-700" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
                  <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
                </svg>
              </div>
            ) : (
              'Send OTP'
            )}
          </button>

        </form>
      </div>
    </div>
  );
}

export default MobileSelectionScreen;