"use client"; // This component uses client-side features

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import MessageModal from '../../components/MessageModal'; // Correct path for JS
import LoadingSpinner from '../../components/LoadingSpinner'; // Correct path for JS

export default function SignupPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profileImage, setProfileImage] = useState(''); // Optional, for direct URL input
  const [imageFile, setImageFile] = useState(null); // For file upload
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', message: '' });
  const { signup, loading } = useAuth();
  const router = useRouter();

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
      setProfileImage(URL.createObjectURL(e.target.files[0])); // Show preview if needed
    } else {
      setImageFile(null);
      setProfileImage('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("1");
    if (!username || !email || !phone || !password || !confirmPassword) {
      setModalContent({ title: 'Error', message: 'Please fill in all required fields.' });
      setModalOpen(true);
      return;
    }
    console.log("2");
    if (password !== confirmPassword) {
      setModalContent({ title: 'Error', message: 'Passwords do not match.' });
      setModalOpen(true);
      return;
    }
console.log("3");
    const formData = new FormData();
    formData.append('username', username);
    formData.append('email', email);
    formData.append('phone', phone);
    formData.append('password', password);
    formData.append('confirmPassword', confirmPassword);
    if (imageFile) {
      formData.append('image', imageFile); // 'image' should match the field name in multer middleware
    }
   console.log("4");
    const result = await signup(formData);
    if (result.success) {
      setModalContent({ title: 'Signup Successful', message: result.message + ' Please verify your email.' });
      setModalOpen(true);
      router.push('/auth/verify-otp'); // Redirect to OTP verification page
    } else {
      setModalContent({ title: 'Signup Failed', message: result.message });
      setModalOpen(true);
    }
    console.log("5");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="card w-full max-w-md animate-fadeIn">
        <h2 className="text-3xl font-bold text-center text-primary-700 mb-8">Join Bondify</h2>
        {loading && <LoadingSpinner />}
        {!loading && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <input
                type="text"
                id="username"
                className="input-field"
                placeholder="John Doe"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
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
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="tel"
                id="phone"
                className="input-field"
                placeholder="1234567890"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
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
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
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
            <div>
              <label htmlFor="profileImage" className="block text-sm font-medium text-gray-700 mb-1">Profile Image</label>
              <input
                type="file"
                id="profileImage"
                accept="image/*"
                className="input-field file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                onChange={handleFileChange}
              />
              {profileImage && (
                <img src={profileImage} alt="Profile Preview" className="mt-2 w-24 h-24 rounded-full object-cover border border-gray-300" />
              )}
            </div>
            <button
              type="submit"
              className="btn-primary w-full"
            >
              Sign Up
            </button>
            <p className="text-center text-sm text-gray-600 mt-4">
              Already have an account?{' '}
              <Link href="/auth/login" >
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
