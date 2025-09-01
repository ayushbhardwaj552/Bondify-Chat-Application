"use client"; // This component uses client-side features

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import MessageModal from '../../components/MessageModal'; // Correct path for JS
import LoadingSpinner from '../../components/LoadingSpinner'; // Correct path for JS

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api/v1";

export default function VerifyOtpPage() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', message: '' });
  const router = useRouter();
  const searchParams = useSearchParams();

  // Pre-fill email if passed as query param (e.g., from signup)
  React.useEffect(() => {
    const emailFromParams = searchParams.get('email');
    if (emailFromParams) {
      setEmail(emailFromParams);
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !otp) {
      setModalContent({ title: 'Error', message: 'Please enter both email and OTP.' });
      setModalOpen(true);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/verify-otp`, { email, otp });
      setLoading(false);
      setModalContent({ title: 'Success', message: response.data.message + ' You can now log in.' });
      setModalOpen(true);
      router.push('/auth/login'); // Redirect to login page
    } catch (error) {
      setLoading(false);
      setModalContent({ title: 'Verification Failed', message: error.response?.data?.message || 'OTP verification failed.' });
      setModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="card w-full max-w-md animate-fadeIn">
        <h2 className="text-3xl font-bold text-center text-primary-700 mb-8">Verify Your Account</h2>
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
            <button
              type="submit"
              className="btn-primary w-full"
            >
              Verify OTP
            </button>
            <p className="text-center text-sm text-gray-600 mt-4">
              Remember your password?{' '}
              <Link href="/auth/login" passHref>
                <span className="text-primary-600 hover:underline font-medium cursor-pointer">Log In</span>
              </Link>
            </p>
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
