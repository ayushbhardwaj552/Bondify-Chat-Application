"use client"; // This component uses client-side features

import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext'; // Import useAuth to get the current user

// Base URL for your backend API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api/v1";

// Create the Chat Context
const ChatContext = createContext();

// ChatProvider component
export const ChatProvider = ({ children }) => {
  const { user: currentUser, token } = useAuth(); // Get current authenticated user
  const [selectedChat, setSelectedChat] = useState(null); // The currently active chat (user or group)
  const [messages, setMessages] = useState([]); // Messages for the selected chat
  const [allUsers, setAllUsers] = useState([]); // All registered users
  const [userGroups, setUserGroups] = useState([]); // Groups the current user is a member of
  const [loadingChats, setLoadingChats] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [isTyping, setIsTyping] = useState(false); // Typing indicator state for the selected chat

  // Function to fetch all registered users
  const fetchAllUsers = async () => {
    if (!token) return;
    setLoadingChats(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/getAll`);
      setAllUsers(response.data.data);
      setLoadingChats(false);
    } catch (error) {
      setLoadingChats(false);
      console.error("Error fetching all users:", error.response?.data?.message || error.message);
      // Handle error (e.g., show a toast notification)
    }
  };

  // Function to fetch groups the user is part of
  const fetchUserGroups = async () => {
    if (!token || !currentUser?._id) return;
    setLoadingChats(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/user/${currentUser._id}`);
      setUserGroups(response.data.groups);
      setLoadingChats(false);
    } catch (error) {
      setLoadingChats(false);
      console.error("Error fetching user groups:", error.response?.data?.message || error.message);
      // Handle error
    }
  };

  // Function to fetch messages for a specific chat
  const fetchMessages = async (chatId) => {
    if (!token || !chatId) {
      setMessages([]); // Clear messages if no chat is selected
      return;
    }
    setLoadingMessages(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/chat/${chatId}`);
      setMessages(response.data.data);
      setLoadingMessages(false);
    } catch (error) {
      setLoadingMessages(false);
      console.error("Error fetching messages:", error.response?.data?.message || error.message);
      setMessages([]); // Clear messages on error
    }
  };

  // Effect to load initial chat data when user logs in
  useEffect(() => {
    if (currentUser && token) {
      fetchAllUsers();
      fetchUserGroups();
    } else {
      // Clear all chat-related state on logout
      setAllUsers([]);
      setUserGroups([]);
      setSelectedChat(null);
      setMessages([]);
    }
  }, [currentUser, token]);

  // Effect to fetch messages when selectedChat changes
  useEffect(() => {
    if (selectedChat) {
      // Determine the actual chatId for fetching messages
      const actualChatId = selectedChat.type === 'group' ? selectedChat._id : selectedChat.chatId;
      fetchMessages(actualChatId);
    } else {
      setMessages([]);
    }
  }, [selectedChat]);


  // Function to send a message
  const sendMessage = async (messageContent) => {
    if (!messageContent.trim() || !selectedChat || !currentUser?._id || !token) {
      return { success: false, message: "Cannot send empty message or no chat selected." };
    }

    // Determine receiverId or groupId based on selectedChat type
    let receiverId = null;
    let groupId = null;
    let chatId = selectedChat.chatId; // Use the consistent chatId from selectedChat object

    if (selectedChat.type === 'user') {
      receiverId = selectedChat._id;
    } else if (selectedChat.type === 'group') {
      groupId = selectedChat._id;
      chatId = selectedChat._id; // For groups, the groupId IS the chatId
    } else if (selectedChat.type === 'ai') {
        // AI chat logic is handled separately, no direct message send to AI endpoint here
        // This function will primarily handle user-to-user/group messages
        return { success: false, message: "AI chat messages are handled via a different function." };
    }


    try {
      const messageData = {
        senderId: currentUser._id,
        receiverId,
        groupId,
        content: messageContent,
        chatId, // Pass the consolidated chatId to backend
      };
      
      const response = await axios.post(`${API_BASE_URL}/sendMessage`, messageData);
      
      // Optimistically update UI
      setMessages(prev => [...prev, {
        _id: response.data.data._id, // Assign actual ID from backend
        sender: { _id: currentUser._id, username: currentUser.username, profileImage: currentUser.profileImage },
        receiver: receiverId ? { _id: receiverId } : null,
        group: groupId,
        content: messageContent,
        chatId: chatId,
        timestamp: new Date().toISOString(),
      }]);
      
      return { success: true, message: response.data.message, data: response.data.data };
    } catch (error) {
      console.error("Error sending message:", error.response?.data?.message || error.message);
      return { success: false, message: error.response?.data?.message || "Failed to send message" };
    }
  };

  const chatContextValue = {
    selectedChat,
    setSelectedChat,
    messages,
    setMessages, // Allows real-time updates from SocketProvider
    allUsers,
    userGroups,
    loadingChats,
    loadingMessages,
    sendMessage,
    fetchMessages, // Expose for re-fetching
    fetchAllUsers, // Expose for re-fetching
    fetchUserGroups, // Expose for re-fetching
    isTyping,
    setIsTyping,
  };

  return (
    <ChatContext.Provider value={chatContextValue}>
      {children}
    </ChatContext.Provider>
  );
};

// Custom hook to use the Chat Context
export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
