"use client"; // This component uses client-side features

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import MessageModal from '../../components/MessageModal'; // Correct path for JS
import LoadingSpinner from '../../components/LoadingSpinner'; // Correct path for JS

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api/v1";

export default function ResetPasswordRequestPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', message: '' });
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setModalContent({ title: 'Error', message: 'Please enter your email address.' });
      setModalOpen(true);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/resetPassword`, { email });
      setLoading(false);
      setModalContent({
        title: 'OTP Sent',
        message: response.data.message + ' Please check your email for the OTP and proceed to set a new password.'
      });
      setModalOpen(true);
      router.push(`/auth/new-password?email=${email}`); // Redirect to new password page with email pre-filled
    } catch (error) {
      setLoading(false);
      setModalContent({ title: 'Error', message: error.response?.data?.message || 'Failed to send reset OTP.' });
      setModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="card w-full max-w-md animate-fadeIn">
        <h2 className="text-3xl font-bold text-center text-primary-700 mb-8">Reset Password</h2>
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
            <button
              type="submit"
              className="btn-primary w-full"
            >
              Send Reset OTP
            </button>
            <p className="text-center text-sm text-gray-600 mt-4">
              <Link href="/auth/login" passHref>
                <span className="text-primary-600 hover:underline font-medium cursor-pointer">Back to Login</span>
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
