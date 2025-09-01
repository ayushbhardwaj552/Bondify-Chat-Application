"use client"; // This component uses client-side features

import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../../components/Navbar'; // Correct path for JS
import MessageModal from '../../components/MessageModal'; // Correct path for JS
import LoadingSpinner from '../../components/LoadingSpinner'; // Correct path for JS
import { useAuth } from '../../context/AuthContext'; // Correct path for JS
import { Send, Sparkles } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api/v1";

// Ensure you have your Google API Key for client-side fallback if backend AI is not configured
const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;

export default function AIChatPage() {
  const { user, loading: authLoading } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', message: '' });
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Welcome message from AI
    if (!authLoading && user && messages.length === 0) {
      setMessages([
        { sender: 'ai', content: `Hello ${user.username || 'there'}! How can I assist you today?`, timestamp: new Date().toISOString() }
      ]);
    }
  }, [authLoading, user, messages.length]);

  // Scroll to the latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || aiLoading) return;

    const userMessage = { sender: 'user', content: inputMessage, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setAiLoading(true);

    try {
      let aiResponse;
      if (GOOGLE_API_KEY) { // If client-side AI key is present, use it as a fallback
        const { GoogleGenerativeAI } = await import('@google/generative-ai');
        const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent(inputMessage);
        const response = await result.response;
        aiResponse = response.text();
      } else { // Otherwise, try to use the backend
        const response = await axios.post(`${API_BASE_URL}/ai/chat`, { message: inputMessage });
        aiResponse = response.data.data.message;
      }
      
      setMessages(prev => [...prev, { sender: 'ai', content: aiResponse, timestamp: new Date().toISOString() }]);
    } catch (error) {
      console.error("Error communicating with AI:", error);
      setModalContent({
        title: 'AI Error',
        message: error.response?.data?.message || 'Failed to get a response from the AI. Please ensure your GOOGLE_API_KEY is set in .env.local or your backend AI service is running correctly.'
      });
      setModalOpen(true);
      setMessages(prev => [...prev, { sender: 'ai', content: "Sorry, I'm having trouble connecting right now. Please try again later.", timestamp: new Date().toISOString() }]);
    } finally {
      setAiLoading(false);
    }
  };

  if (authLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Navbar />
      <div className="flex flex-col flex-1 max-w-4xl mx-auto w-full p-4 overflow-hidden">
        <h2 className="text-4xl font-extrabold text-center text-primary-700 my-6 flex items-center justify-center gap-3 animate-fadeIn">
          <Sparkles className="h-9 w-9 text-secondary-500 animate-pulse" />
          AI Chat Assistant
        </h2>

        {/* Chat window */}
        <div className="flex-1 bg-white rounded-xl shadow-lg p-6 overflow-y-auto custom-scrollbar mb-4 animate-slideInLeft">
          <div className="flex flex-col space-y-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`message-bubble animate-bubblePop ${
                    msg.sender === 'user' ? 'sent' : 'received'
                  }`}
                >
                  <p className="font-semibold">{msg.sender === 'user' ? user?.username || 'You' : 'Bondify AI'}</p>
                  <p>{msg.content}</p>
                  <span className="text-xs opacity-75 mt-1 block">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
            {aiLoading && (
              <div className="flex justify-start">
                <div className="message-bubble received flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-t-2 border-gray-300 border-t-gray-500"></div>
                  <span>Thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} /> {/* Scroll target */}
          </div>
        </div>

        {/* Message input */}
        <form onSubmit={handleSendMessage} className="flex items-center space-x-3 p-4 bg-white rounded-xl shadow-lg animate-fadeIn">
          <input
            type="text"
            className="input-field flex-1"
            placeholder="Type your message to AI..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            disabled={aiLoading}
          />
          <button
            type="submit"
            className="btn-primary p-3 rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-200"
            disabled={aiLoading}
          >
            {aiLoading ? (
              <div className="animate-spin h-5 w-5 border-2 border-t-2 border-primary-100 border-t-white"></div>
            ) : (
              <Send className="h-6 w-6" />
            )}
          </button>
        </form>
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
