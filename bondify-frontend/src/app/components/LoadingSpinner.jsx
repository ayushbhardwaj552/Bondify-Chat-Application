"use client"; // This component uses client-side features

import React from 'react';

export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center h-full w-full">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-4 border-primary-200 border-t-primary-600"></div>
    </div>
  );
}
