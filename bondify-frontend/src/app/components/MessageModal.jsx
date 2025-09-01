"use client"; // This component uses client-side features

import React from 'react';

export default function MessageModal({ isOpen, onClose, title, message, onConfirm, showCancel = false }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-[100] animate-fadeIn">
      <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-sm transform transition-all duration-300 animate-bubblePop">
        <h3 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">{title}</h3>
        <p className="text-gray-700 mb-6">{message}</p>
        <div className="flex justify-end space-x-3">
          {showCancel && (
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors duration-200"
            >
              Cancel
            </button>
          )}
          <button
            onClick={() => {
              if (onConfirm) onConfirm();
              onClose();
            }}
            className="btn-primary"
          >
            {showCancel ? 'Confirm' : 'OK'}
          </button>
        </div>
      </div>
    </div>
  );
}
