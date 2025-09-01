"use client"; // This component uses client-side features

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext'; // Correct path for JS
import MessageModal from '../../components/MessageModal'; // Correct path for JS
import LoadingSpinner from '../../components/LoadingSpinner'; // Correct path for JS

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', message: '' });
  const { login, loading } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setModalContent({ title: 'Error', message: 'Please fill in all fields.' });
      setModalOpen(true);
      return;
    }

    const result = await login(email, password);
    if (!result.success) {
      setModalContent({ title: 'Login Failed', message: result.message });
      setModalOpen(true);
    }
    // Success is handled by redirect in AuthContext
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="card w-full max-w-md animate-fadeIn">
        <h2 className="text-3xl font-bold text-center text-primary-700 mb-8">Login to Bondify</h2>
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
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
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
            <button
              type="submit"
              className="btn-primary w-full"
            >
              Log In
            </button>
            <p className="text-center text-sm text-gray-600 mt-4">
              Don't have an account?{' '}
              <Link href="/auth/signup" passHref>
                <span className="text-primary-600 hover:underline font-medium cursor-pointer">Sign Up</span>
              </Link>
            </p>
            <p className="text-center text-sm text-gray-600">
              <Link href="/auth/reset-password" passHref>
                <span className="text-secondary-600 hover:underline font-medium cursor-pointer">Forgot Password?</span>
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
