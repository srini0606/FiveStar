// src/components/LoanInputScreen.js
import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import logoImage from '../assets/images/logo.png';
import { useAuth } from '../contexts/AuthContext';
import { XMarkIcon } from '@heroicons/react/24/outline';
import CustomCaptcha from './CustomCaptcha';
import CryptoJS from 'crypto-js';

const SECRET_KEY = "my32characterlongsupersecretkey!";
const IV_STRING = "mycharinitvector";

function LoanInputScreen() {
  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    mode: 'all',
  });
  const navigate = useNavigate();
  const [inputType, setInputType] = useState('');
  const { setAuthenticated, setMobileSelected } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clearData, setClearData] = useState(false);
  const captchaRef = useRef(null);

  const notify = (message) => toast.error(message, {
    position: "top-center",
    autoClose: 5000,
    hideProgressBar: true,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
  });

  function decryptJsonFromNode(encryptedData, iv) {
    const SECRET_KEY = "e9LzmigPeFo0YN)";
    const key = CryptoJS.SHA256(SECRET_KEY);

    const decrypted = CryptoJS.AES.decrypt(
        { ciphertext: CryptoJS.enc.Base64.parse(encryptedData) },
        key,
        {
            iv: CryptoJS.enc.Base64.parse(iv),
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7,
        }
    );

    const decryptedString = decrypted.toString(CryptoJS.enc.Utf8);
    return JSON.parse(decryptedString);
  }

  const fetchLoanDetails = async (loanNumber) => {
    setIsSubmitting(true);
    const url = `${process.env.REACT_APP_API_HOST}/api/auth/listLoanDetails`;
    const headers = {
      "Content-Type": "application/json",
      "x-client-type": "web"
    };
    const body = JSON.stringify({
      DeviceId: "browser",  // Assuming 'browser' is a placeholder value
      LoanNumber: loanNumber,
      NumberType: 1,  // Assuming '1' is a placeholder value
      DetailsType: "u"
    });

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: body
      });
      const responseData = await response.json();

      if (response.ok) {
        setAuthenticated(true);
        const decryptedJson = decryptJsonFromNode(responseData.data.encryptedData,responseData.data.iv);
        const mobileNumbers = decryptedJson.customerMobiles.map(m => m.applicantMobile);
        const loanDetails = decryptedJson.loanDetails;

        navigate(`/select-mobile`, {
          state: {
            flow: "loan",
            mobileNumbers: mobileNumbers,
            loanNumber: loanDetails.loanAccount,
            customerName: loanDetails.customerName
          }
        });
      } else {
        notify(responseData.status.message || "Error fetching details with loan number.");
      }
    } catch (error) {
      notify("Network error while fetching loan details.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMobileNumberSubmit = async (mobileNumber) => {
    setIsSubmitting(true);
    const url = `${process.env.REACT_APP_API_HOST}/api/cms/sendOTP`;
    const headers = {
      "Content-Type": "application/json",
      "x-client-type": "web"
    };
    const body = JSON.stringify({ mobile_number: mobileNumber });

    try {
      const response = await fetch(url, { method: 'POST', headers: headers, body: body });
      const responseData = await response.json();

      if (response.ok && responseData.status.code === 200) {
        // Handle success 
        setMobileSelected(true);
        navigate(`/verify-otp`, {
          state: {
            flow: "mobile",
            mobileNumber: mobileNumber // Assuming mobile number is required on the next page
          }
        });
      } else {
        // Handle server or other errors
        notify(responseData.status.message || "Error occurred while sending OTP.");
      }
    } catch (error) {
      // Handle network errors
      notify("Network error while sending OTP.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmit = (data) => {
    if (!captchaRef.current.validateCaptcha()) {
      notify("Invalid CAPTCHA. Please try again.");
      return;
    }

    if (inputType === 'loan') {
      fetchLoanDetails(data.loanNumber);
    } else {
      handleMobileNumberSubmit(encryptMobileNumber(data.mobileNumber));
    }
  };
  const clearInput = (fieldName) => {
    setValue(fieldName, '');
    setClearData(false);
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
      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar
      />
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        <div className="mb-6">
          <img src={logoImage} alt="Five Star Company Logo" className="mx-auto h-12 w-auto" />
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {(inputType === "" || inputType === 'loan') && (
            <div className="relative">
              <label htmlFor="loanNumber" className="block text-sm font-medium text-gray-700">
                Loan Number
              </label>
              <input
                {...register("loanNumber", {
                  required: true,
                  minLength: { value: 7, message: "Loan number must be 7 digits" },
                  maxLength: { value: 7, message: "Loan number must be 7 digits" },
                  pattern: { value: /^[0-9]{7}$/, message: "Loan number must be 7 digits" },
                })}
                onInput={(e) => {
                  e.target.value = e.target.value.replace(/[^0-9]/g, '').substring(0, 7);
                  setClearData(e.target.value.length > 0);
                }}
                onClick={() => setInputType('loan')}
                id="loanNumber"
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none  ${errors.loanNumber ? "border-red-500" : "border-gray-300"}`}
                placeholder="Enter your loan number"
                disabled={isSubmitting}
              />
              {errors.loanNumber && <span className="text-red-500 text-xs">Loan Number is required</span>}
              {clearData && (
                <button
                  type="button"
                  onClick={() => clearInput('loanNumber')}
                  aria-label="Clear Loan Number"
                  className="absolute right-2 top-8 text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className='h-5 w-5 text-red-500' aria-hidden="true" />
                </button>
              )}
            </div>
          )}

          {(inputType === "") && (<div className="flex items-center my-4">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="mx-4 text-gray-600">OR</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>)}

          {(inputType === "" || inputType === 'mobile') && (
            <div className="relative">
              <label htmlFor="mobileNumber" className="block text-sm font-medium text-gray-700">
                Mobile Number
              </label>
              <input
                {...register("mobileNumber", {
                  required: true,
                  minLength: { value: 10, message: "Loan number must be 10 digits" },
                  maxLength: { value: 10, message: "Loan number must be 10 digits" },
                })}
                onInput={(e) => {
                  e.target.value = e.target.value.replace(/[^0-9]/g, '').substring(0, 10);
                  setClearData(e.target.value.length > 0);
                }}
                onClick={() => setInputType('mobile')}
                id="mobileNumber"
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none ${errors.mobileNumber ? "border-red-500" : "border-gray-300"}`}
                placeholder="Enter your mobile number"
                disabled={isSubmitting}
              />
              {errors.mobileNumber && <span className="text-red-500 text-xs">Mobile Number is required</span>}
              {clearData && (
                <button
                  type="button"
                  onClick={() => clearInput('mobileNumber')}
                  aria-label="Clear Mobile Number"
                  className="absolute right-2 top-8 text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className='w-5 h-5 text-red-500' aria-hidden="true" />
                </button>
              )}
            </div>
          )}
          <CustomCaptcha ref={captchaRef} />
          <button
            type="submit"
            className={isSubmitting ? "w-full flex justify-center py-2 px-4 border border-transparent bg-secondary-light rounded-md shadow-sm text-sm font-medium text-white cursor-pointer" : "bg-secondary w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white cursor-pointer"}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <div role="status" className='flex items-center gap-8'>
                <span className="">Submiting...</span>
                <svg aria-hidden="true" className="w-4 h-4 text-gray-200 animate-spin dark:text-gray-600 fill-red-700" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
                  <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
                </svg>
              </div>
            ) : (
              'Submit'
            )}
          </button>

          {inputType === 'loan' && (
            <p className="text-center mt-4">
              <span onClick={() => setInputType('mobile')} className="cursor-pointer text-secondary text-sm  hover:text-secondary-light">
                Switch to Mobile Number
              </span>
            </p>
          )}
          {inputType === 'mobile' && (
            <p className="text-center mt-4">
              <span onClick={() => setInputType('loan')} className="cursor-pointer text-secondary text-sm hover:text-secondary-light">
                Switch to Loan Number
              </span>
            </p>
          )}
        </form>
      </div>
    </div>
  );
}

export default LoanInputScreen;