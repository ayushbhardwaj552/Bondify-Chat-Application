"use client"; // This component uses client-side features

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import { useAuth } from '@/context/AuthContext'; // Correct path for JS
import { useChat } from '@/context/ChatContext'; // Correct path for JS

const SocketContext = createContext();

const SOCKET_SERVER_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

export const SocketProvider = ({ children }) => {
  const { user: currentUser, isAuthenticated, token } = useAuth();
  const { selectedChat, setMessages, setIsTyping } = useChat();
  const socketRef = useRef(null);

  // Initialize Socket.IO connection
  useEffect(() => {
    if (isAuthenticated() && currentUser) {
      // Connect only if authenticated
      socketRef.current = io(SOCKET_SERVER_URL, {
        query: { userId: currentUser._id, token: token }, // Pass user ID and token for authentication
        transports: ['websocket'], // Prefer websocket
      });

      // Event listeners
      socketRef.current.on('connect', () => {
        console.log('Socket.IO connected:', socketRef.current.id);
        if (selectedChat) {
          const chatIdToJoin = selectedChat.type === 'group' ? selectedChat._id : selectedChat.chatId;
          socketRef.current.emit('joinChat', chatIdToJoin);
        }
      });

      socketRef.current.on('receiveMessage', (message) => {
        console.log('Received message:', message);
        setMessages(prevMessages => [...prevMessages, message]);
      });

      socketRef.current.on('typing', (chatId) => {
        if (selectedChat && (selectedChat.type === 'group' && selectedChat._id === chatId) || (selectedChat.type === 'user' && selectedChat.chatId === chatId)) {
          setIsTyping(true);
        }
      });

      socketRef.current.on('stopTyping', (chatId) => {
        if (selectedChat && (selectedChat.type === 'group' && selectedChat._id === chatId) || (selectedChat.type === 'user' && selectedChat.chatId === chatId)) {
          setIsTyping(false);
        }
      });

      socketRef.current.on('disconnect', () => {
        console.log('Socket.IO disconnected');
      });

      socketRef.current.on('connect_error', (err) => {
        console.error('Socket.IO connection error:', err.message);
      });

    } else if (!isAuthenticated() && socketRef.current) {
      // Disconnect if user logs out
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    // Clean up on component unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [isAuthenticated, currentUser, token, selectedChat]); // Reconnect when auth state or selectedChat changes

  // Join/Leave chat rooms when selectedChat changes
  useEffect(() => {
    if (socketRef.current && selectedChat) {
      const chatIdToJoin = selectedChat.type === 'group' ? selectedChat._id : selectedChat.chatId;
      socketRef.current.emit('joinChat', chatIdToJoin);
      // Optional: leave previous chat room if implemented
    }
  }, [selectedChat]);


  const socketContextValue = {
    socket: socketRef.current,
    emitEvent: (event, data) => {
      if (socketRef.current && socketRef.current.connected) {
        socketRef.current.emit(event, data);
      } else {
        console.warn('Socket not connected. Cannot emit event:', event);
      }
    },
  };

  return (
    <SocketContext.Provider value={socketContextValue}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
