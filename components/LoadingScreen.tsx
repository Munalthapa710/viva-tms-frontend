// components/LoadingScreen.tsx
"use client";

import React from "react";

const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-gray-300"></div>
      <p className="mt-4 text-gray-700 font-medium text-lg">Loading...</p>
    </div>
  );
};


export default LoadingScreen;
