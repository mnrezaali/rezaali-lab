import React from 'react';

export default function LoadingSpinner() {
  return (
    <div className="fade-in flex flex-col items-center justify-center py-16">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-blue-200 dark:border-blue-800 rounded-full animate-spin border-t-blue-600 dark:border-t-blue-400"></div>
        <div className="absolute inset-0 w-16 h-16 border-4 border-transparent rounded-full animate-pulse border-t-blue-400 dark:border-t-blue-300" style={{ animationDelay: '0.5s' }}></div>
      </div>
      <h3 className="mt-6 text-lg font-medium text-gray-900 dark:text-white">
        Analyzing Your Presentation...
      </h3>
      <p className="mt-2 text-gray-600 dark:text-gray-300 text-center max-w-md">
        Our AI is carefully reviewing your content for structure, clarity, engagement, and areas for improvement.
      </p>
      <div className="mt-4 flex space-x-2">
        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
      </div>
    </div>
  );
}
