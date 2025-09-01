"use client"; // This component uses client-side features

import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

// Base URL for your backend API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api/v1";

// Create the Auth Context
const AuthContext = createContext();

// AuthProvider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Function to load user and token from localStorage on component mount
  useEffect(() => {
    const loadUserData = () => {
      try {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        }
      } catch (error) {
        console.error("Failed to load user data from localStorage:", error);
        // Clear invalid data if any
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };
    loadUserData();
  }, []);

  // Function to handle user login
  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/login`, { email, password });
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setToken(token);
      setUser(user);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setLoading(false);
      router.push('/dashboard'); // Redirect to dashboard after login
      return { success: true, message: response.data.message };
    } catch (error) {
      setLoading(false);
      console.error("Login failed:", error.response?.data?.message || error.message);
      return { success: false, message: error.response?.data?.message || "Login failed" };
    }
  };

  // Function to handle user signup
  const signup = async (formData) => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/signup`, formData);
      setLoading(false);
      // After successful signup, user needs to verify OTP, then can login
      return { success: true, message: response.data.message };
    } catch (error) {
      setLoading(false);
      console.error("Signup failed:", error.response?.data?.message || error.message);
      return { success: false, message: error.response?.data?.message || "Signup failed" };
    }
  };

  // Function to handle user logout
  const logout = async () => {
    setLoading(true);
    try {
      await axios.get(`${API_BASE_URL}/signout`); // Call backend signout
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setToken(null);
      setUser(null);
      delete axios.defaults.headers.common['Authorization'];
      setLoading(false);
      router.push('/login'); // Redirect to login page after logout
      return { success: true, message: "Logged out successfully" };
    } catch (error) {
      setLoading(false);
      console.error("Logout failed:", error.response?.data?.message || error.message);
      return { success: false, message: error.response?.data?.message || "Logout failed" };
    }
  };

  // Function to check if user is authenticated
  const isAuthenticated = () => !!token && !!user;

  const authContextValue = {
    user,
    token,
    loading,
    isAuthenticated,
    login,
    signup,
    logout,
    setUser, // Allow updating user data (e.g., after profile update)
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the Auth Context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
