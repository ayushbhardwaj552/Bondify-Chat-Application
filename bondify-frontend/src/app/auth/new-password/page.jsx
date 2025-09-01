"use client"; // This component uses client-side features

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import MessageModal from '../../components/MessageModal'; // Correct path for JS
import LoadingSpinner from '../../components/LoadingSpinner'; // Correct path for JS

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api/v1";

export default function NewPasswordPage() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', message: '' });
  const router = useRouter();
  const searchParams = useSearchParams();

  // Pre-fill email if passed as query param from reset-password page
  React.useEffect(() => {
    const emailFromParams = searchParams.get('email');
    if (emailFromParams) {
      setEmail(emailFromParams);
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !otp || !password || !confirmPassword) {
      setModalContent({ title: 'Error', message: 'Please fill in all fields.' });
      setModalOpen(true);
      return;
    }
    if (password !== confirmPassword) {
      setModalContent({ title: 'Error', message: 'Passwords do not match.' });
      setModalOpen(true);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/afterResetPassword`, { email, otp, password, confirmPassword });
      setLoading(false);
      setModalContent({ title: 'Success', message: response.data.message + ' You can now log in with your new password.' });
      setModalOpen(true);
      router.push('/auth/login'); // Redirect to login page
    } catch (error) {
      setLoading(false);
      setModalContent({ title: 'Password Reset Failed', message: error.response?.data?.message || 'Failed to reset password.' });
      setModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="card w-full max-w-md animate-fadeIn">
        <h2 className="text-3xl font-bold text-center text-primary-700 mb-8">Set New Password</h2>
        {loading && <LoadingSpinner />}
        {!loading && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                id="email"
                className="input-field"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-1">OTP</label>
              <input
                type="text"
                id="otp"
                className="input-field"
                placeholder="Enter 6-digit OTP"
                maxLength="6"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <input
                type="password"
                id="password"
                className="input-field"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
              <input
                type="password"
                id="confirmPassword"
                className="input-field"
                placeholder="********"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="btn-primary w-full"
            >
              Reset Password
            </button>
          </form>
        )}
      </div>

      <MessageModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={modalContent.title}
        message={modalContent.message}
      />
    </div>
  );
}
