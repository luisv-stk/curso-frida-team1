// File: UploadProgress.tsx

import { useUploadStore } from '@/stores';
import React from 'react';
import { FaRocket } from 'react-icons/fa';


const UploadProgress: React.FC = () => {
  const { files } = useUploadStore();
  return (
    <div className="flex items-center relative justify-center bg-white rounded-lg border-2 border-blue-200">
      <div className="w-full mx-auto rounded-lg flex flex-col items-center">
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
            {`${files[0].name} - (${(files[0].size / (1024 * 1024)).toFixed(2)} Mb)`}.
          </p>
        </div>
      </div>
    </div>
  );
};

export default UploadProgress;