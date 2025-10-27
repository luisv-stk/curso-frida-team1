// File: UploadProgress.tsx

import React from 'react';
import { FaRocket } from 'react-icons/fa';

interface UploadProgressProps {
  fileName?: string;
  fileSize?: string;
}

const UploadProgress: React.FC<UploadProgressProps> = ({ fileName, fileSize }) => {
  return (
    <div className="w-screen h-screen flex items-center justify-center bg-white">
      <div className="w-full max-w-md mx-auto border rounded-lg shadow-md bg-f5f9fd flex flex-col items-center">
        <div className="p-8">
          <div className="flex justify-center items-center mb-4">
            <FaRocket className="text-7xl text-blue-500" />
            <div className="absolute text-pink-600 text-3xl mt-16">
              <FaRocket className="animate-pulse" />
            </div>
          </div>
          <div className="flex justify-center items-center space-x-1 mb-2">
            {Array.from({ length: 15 }).map((_, index) => (
              <div
                key={index}
                className={`h-1 w-3 ${index < 5 ? 'bg-blue-700' : 'bg-blue-300'}`}
              ></div>
            ))}
          </div>
          <h2 className="text-center text-lg font-semibold">
            Subiendo
          </h2>
          <p className="text-center text-gray-700">
            {fileName} - {fileSize}.
          </p>
        </div>
      </div>
    </div>
  );
};

export default UploadProgress;