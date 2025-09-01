"use client"; // This component uses client-side features

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext'; // Correct path for JS
import { LogOut, User as UserIcon, MessageSquare, Bot } from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, logout, loading } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setDropdownOpen(false);
  };

  if (loading) {
    return null; // Or a loading spinner
  }

  return (
    <nav className="relative bg-gradient-to-r from-primary-600 to-secondary-600 shadow-lg p-4 flex justify-between items-center z-50 animate-fadeIn">
      {/* Brand Logo/Name */}
      <Link href="/" passHref>
        <span className="text-white text-2xl font-bold tracking-wide cursor-pointer hover:text-primary-100 transition-colors duration-200">
          Bondify
        </span>
      </Link>

      {/* Navigation Links or User Actions */}
      <div className="flex items-center space-x-4">
        {isAuthenticated() ? (
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center space-x-2 text-white text-lg font-medium hover:text-primary-100 transition-colors duration-200 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-300 p-2"
            >
              {user?.profileImage ? (
                <img
                  src={user.profileImage}
                  alt="Profile"
                  className="w-10 h-10 rounded-full border-2 border-white object-cover shadow-sm"
                />
              ) : (
                <UserIcon className="w-10 h-10 rounded-full bg-primary-500 p-2 text-white" />
              )}
              <span className="hidden md:block">{user?.username || 'User'}</span>
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-2 animate-slideInRight origin-top-right">
                <Link href="/dashboard" passHref>
                  <span className="flex items-center px-4 py-2 text-gray-800 hover:bg-gray-100 transition-colors duration-150 cursor-pointer">
                    <MessageSquare className="mr-2 h-5 w-5 text-primary-500" />
                    Dashboard
                  </span>
                </Link>
                <Link href="/profile" passHref>
                  <span className="flex items-center px-4 py-2 text-gray-800 hover:bg-gray-100 transition-colors duration-150 cursor-pointer">
                    <UserIcon className="mr-2 h-5 w-5 text-primary-500" />
                    Profile
                  </span>
                </Link>
                <Link href="/ai-chat" passHref>
                  <span className="flex items-center px-4 py-2 text-gray-800 hover:bg-gray-100 transition-colors duration-150 cursor-pointer">
                    <Bot className="mr-2 h-5 w-5 text-secondary-500" />
                    AI Chat
                  </span>
                </Link>
                <hr className="my-1 border-gray-200" />
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center px-4 py-2 text-red-600 hover:bg-red-50 transition-colors duration-150 text-left"
                >
                  <LogOut className="mr-2 h-5 w-5" />
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex space-x-3">
            <Link href="/login" passHref>
              <span className="btn-primary px-4 py-2 text-sm">Log In</span>
            </Link>
            <Link href="/signup" passHref>
              <span className="btn-secondary px-4 py-2 text-sm">Sign Up</span>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
