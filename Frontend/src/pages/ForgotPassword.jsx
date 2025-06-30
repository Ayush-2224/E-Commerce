import React, { useState } from 'react';
import { useUserAuthStore } from '../store/userAuth.store';
import {toast} from 'react-hot-toast'
function ForgotPassword() {
  const [email, setEmail] = useState('');
  const { forgetPassword } = useUserAuthStore();

  const handleChange = (e) => {
    setEmail(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    try {
      await forgetPassword(email);
      setEmail('');
      toast.success("Email sent successfully");
    } catch (err) {
      console.log(err.message);
      toast.error("Failed to send email. Please check your email and try again");
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-6 text-center">Forgot Password</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={handleChange}
          required
          className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="w-full py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition"
        >
          Send Reset Email
        </button>
      </form>
    </div>
  );
}

export default ForgotPassword;
