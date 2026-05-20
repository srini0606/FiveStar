// src/components/TicketFormScreen.js
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import logoImage from '../assets/images/logo.png';
import { PaperClipIcon } from '@heroicons/react/24/solid'
import { useNavigate, useLocation } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

function TicketFormScreen() {
  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm({
    mode: 'all',
  });
  const [fileName, setFileName] = useState("filename.jpg");
  const [file, setFile] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { mobileNumber = '', loanNumber = '', flow = '', customerName = '' } = location.state || {};
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState();

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      const fileType = selectedFile.type;
      if (fileType === "application/pdf" || fileType === "image/jpeg") {
        setFile(selectedFile);
        setFileName(selectedFile.name);
      } else {
        toast.error("Only JPG and PDF files are allowed for upload.");
        setFile(null);
        setFileName('');
      }
    } else {
      setFile(null);
      setFileName('');
    }
  };
  useEffect(() => {
    setValue("loan_account_number", loanNumber);
    setValue("mobile_number", mobileNumber);
    setValue("name", customerName);
  }, [setValue, loanNumber, mobileNumber, customerName]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);

    // Create form data for submitDocument API
    const formData = new FormData();
    formData.append("loan_account_number", data.loan_account_number);

    // Append the file to the form data if it exists
    if (file) {
      formData.append("attachment", file);
    } else {
      // Handle the case where no file is provided
      toast.error("File attachment is required.");
      setIsSubmitting(false);
      return;
    }

    try {
      // Make the request to the submitDocument API
      const submitDocumentResponse = await axios.post(
        `${process.env.REACT_APP_API_HOST}/api/cms/submitDocument`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data', // Use multipart/form-data header for form data
            "x-client-type": "web"
          }
        }
      );

      // Extract the document path from the response
      const documentPath = submitDocumentResponse.data.data.DocumentPath;

      // Create form data for the createTicketDetails API
      const ticketFormData = new URLSearchParams();

      // Append the necessary fields to ticketFormData
      ticketFormData.append("loan_account_number", data.loan_account_number);
      ticketFormData.append("name", data.name);
      ticketFormData.append("mobile_number", data.mobile_number);
      ticketFormData.append("email", data.email);
      ticketFormData.append("address", data.address);
      ticketFormData.append("pincode", data.pincode);
      ticketFormData.append("query", data.query);
      ticketFormData.append("description", data.description);
      ticketFormData.append("bank_account_number", watch('query') === "credit_information_data_correction" ? data.bank_account_number || "" : "");
      ticketFormData.append("ifsc_code", watch('query') === "credit_information_data_correction" ? data.ifsc_code || "" : "");

      // Append the document path as attachment
      ticketFormData.append("attachment", documentPath);

      // Make the request to the createTicketDetails API
      const createTicketDetailsResponse = await axios.post(
        `${process.env.REACT_APP_API_HOST}/api/cms/createTicketDetails`,
        ticketFormData,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            "x-client-type": "web"
          }
        }
      );

      // Handle the response from createTicketDetails API
      const ticketId = createTicketDetailsResponse.data.data.TicketId;

      // Show success message
      toast.success(`Ticket submitted successfully! Ticket ID: ${ticketId}`);
      setIsSubmitted(true);
      setTicketId(ticketId);
      setFile(null); // Clear the file state variable
      setFileName(''); // Clear the file name state variable
    } catch (error) {
      // Handle any errors
      console.error('Failed to submit Ticket', error);
      toast.error(`Failed to submit Ticket: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleCreateAgain = () => {
    // Reset the isSubmitted state to false to hide the success message
    setIsSubmitted(false);

    // Reset the ticketId state to clear the ticket ID
    setTicketId(null);

    const initialValues = {
      name: location.state.customerName,
      mobile_number: location.state.mobileNumber,
      loan_account_number: location.state.loanNumber,
    };

    reset(initialValues);
  };


  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <div className="flex flex-col items-center justify-center flex-1 py-3" style={{ minHeight: 'calc(100vh - 120px)' }}>
      <div className="w-full max-w-2xl p-8 mx-auto mt-10 bg-white shadow-lg rounded-lg">
        <ToastContainer
          position="top-center"
          autoClose={5000}
          hideProgressBar
        />
        <div className="mb-6">
          <img src={logoImage} alt="Five Star Company Logo" className="mx-auto h-12 w-auto" />
        </div>
        {isSubmitted ? (
          <div className=' w-[600px]'>
            <div className='text-center'>
              <div className='flex items-center justify-center py-4'>
                <CheckCircleIcon className='w-20 h-20 text-lime-500' aria-hidden="true" />
              </div>
              <span className='text-zinc-800 font-medium text-xl py-4'>Successfully Submitted</span>
              <div className='text-zinc-800 font-medium text-xl py-4'>
                Ticket <span className=' text-neutral-500'>#{ticketId}</span> raised  and Acknowledgement sent successfully.
              </div>
            </div>

            <div className="flex items-center justify-center gap-5 m-10">
              <button
                type=""
                className="bg-secondary w-[200px] flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white cursor-pointer"
                onClick={handleCreateAgain}
              >
                Create Again
              </button>
              <button
                type=""
                className="border-secondary text-secondary w-[200px] flex justify-center py-2 px-4 border rounded-md shadow-sm text-sm font-medium cursor-pointer"
                onClick={handleBackToHome}
              >
                Back to Home
              </button>
            </div>
          </div>
        ) : <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 px-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">{`Loan Number ${(flow === "loan") || loanNumber ? "" : "*"}`}</label>
              <input
                type="text"
                disabled={(flow === "loan") || loanNumber ? true : false}
                {...register("loan_account_number", {
                  required: "Loan Number is required",
                  minLength: { value: 7, message: "Enter last 7 digits of Loan Account Number" },
                  // maxLength: { value: 7, message: "Enter last 7 digits of Loan Account Number" }
                })}
                onInput={(e) => {
                  e.target.value = e.target.value.replace(/[^0-9]/g, '').substring(0, 7);
                }}
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none sm:text-sm ${errors.loan_account_number ? "border-red-500" : "border-gray-300"}`}
              />
              {errors.loan_account_number && <span className="text-red-500 text-xs">{errors.loan_account_number.message}</span>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">{`Name ${(flow === "name") || customerName ? "" : "*"}`}</label>
              <input
                type="text"
                disabled={(flow === "name") || customerName ? true : false}
                {...register("name", { required: true })}
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none sm:text-sm ${errors.name ? "border-red-500" : "border-gray-300"}`}
              />
              {errors.name && <span className="text-red-500 text-xs">Name is Required</span>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">{`Mobile Number ${(flow === "mobile") || mobileNumber ? "" : "*"}`}</label>
              <input
                type="text"
                disabled={(flow === "mobile") || mobileNumber ? true : false}
                {...register("mobile_number", { required: true })}
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none sm:text-sm ${errors.mobile_number ? "border-red-500" : "border-gray-300"}`}
              />
              {errors.mobile_number && <span className="text-red-500 text-xs">Mobile Number is Required</span>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email ID *</label>
              <input
                type="email"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
                  }
                })}
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none sm:text-sm ${errors.email ? "border-red-500" : "border-gray-300"}`}
              />
              {errors.email && <span className="text-red-500 text-xs">Email ID is Required</span>}
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">Address *</label>
              <textarea
                {...register("address", { required: true })}
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none sm:text-sm ${errors.address ? "border-red-500" : "border-gray-300"}`}
                rows="1"
              />
              {errors.address && <span className="text-red-500 text-xs">Address is Required</span>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Pin Code *</label>
              <input
                type="text"
                {...register("pincode", {
                  required: true,
                  minLength: { value: 6, message: "Pin Code must be 6 digits" }
                })}
                onInput={(e) => {
                  e.target.value = e.target.value.replace(/[^0-9]/g, '').substring(0, 6);
                }}
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none sm:text-sm ${errors.pincode ? "border-red-500" : "border-gray-300"}`}
              />
              {errors.pincode && <span className="text-red-500 text-xs">Pin Code is Required</span>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Query Related To *</label>
              <select
                {...register("query", { required: true })}
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none sm:text-sm ${errors.query ? "border-red-500" : "border-gray-300"}`}
              >
                <option value="">Select an Option</option>
                <option value="sms">SMS</option>
                <option value="dues">Dues</option>
                <option value="passbook">Passbook</option>
                <option value="payment">Payment</option>
                <option value="settlement">Settlement</option>
                <option value="credit_information_data_correction">Credit information data correction</option>
              </select>
              {errors.query && <span className="text-red-500 text-xs">Query Related To is Required</span>}
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">Detailed Description *</label>
              <textarea
                {...register("description", { required: true })}
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none sm:text-sm ${errors.description ? "border-red-500" : "border-gray-300"}`}
                rows="2"
              />
              {errors.description && <span className="text-red-500 text-xs">Detailed Description is Required</span>}
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">Attach Document *</label>
              <div className="mt-1 flex-wrap items-center">
                <div className='flex'>
                  <input
                    type="file"
                    id="attachment"
                    {...register("attachment", { required: true })}
                    className="hidden" // Hide the file input but keep it functional
                    onChange={handleFileChange}
                  />
                  <input
                    type="text"
                    readOnly
                    aria-label="Selected file name"
                    className={`mr-4 block w-full px-3 py-2  border border-gray-300 rounded-md shadow-sm focus:outline-none sm:text-sm ${errors.attachment ? "border-red-500" : "border-gray-300"}`}
                    placeholder={fileName || "Choose a file"}
                  />
                  <label htmlFor="attachment" className="cursor-pointer bg-gray-100 rounded-md p-2 text-gray-500 inline-block" aria-label="Choose file to attach">
                    <PaperClipIcon className="w-5 h-5" aria-hidden="true" />
                  </label>
                </div>
                {errors.attachment && <span className="text-red-500 text-xs">File is required</span>}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Bank Account Number {watch('query') === "credit_information_data_correction" ? "*" : ""}</label>
              <input
                type="text"
                {...register("bank_account_number", {
                  required: watch('query') === "credit_information_data_correction" ? true : false,
                  minLength: { value: 10, message: "Bank Account Number must be 10 digits" }
                })}
                onInput={(e) => {
                  e.target.value = e.target.value.replace(/[^0-9]/g, '').substring(0, 10);
                }}
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none sm:text-sm ${watch('query') === "credit_information_data_correction" && errors.bank_account_number ? "border-red-500" : "border-gray-300"}`}
              />
              {watch('query') === "credit_information_data_correction" && errors.bank_account_number && <span className="text-red-500 text-xs">Bank Account Number is Required</span>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">IFSC Code {watch('query') === "credit_information_data_correction" ? "*" : ""}</label>
              <input
                type="text"
                {...register("ifsc_code", {
                  required: watch('query') === "credit_information_data_correction" ? true : false
                })}
                onInput={(e) => {
                  let value = e.target.value;
                  let letters = value.slice(0, 4).replace(/[^a-zA-Z]/g, '').toUpperCase();
                  let numbers = value.slice(4).replace(/[^0-9]/g, '').substring(0, 7);
                  e.target.value = letters + numbers;
                }}
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none sm:text-sm ${watch('query') === "credit_information_data_correction" && errors.ifsc_code ? "border-red-500" : "border-gray-300"}`}
              />
              {watch('query') === "credit_information_data_correction" && errors.ifsc_code && <span className="text-red-500 text-xs">IFSC Code is Required</span>}
            </div>

          </div>
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
        </form>}

      </div>
    </div>
  );
}

export default TicketFormScreen;
