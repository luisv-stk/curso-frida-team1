// File: UploadSuccessMessage.tsx

import React from 'react';
import { FaCheckCircle } from 'react-icons/fa';

interface UploadSuccessMessageProps {
  fileName?: string;
  fileSize?: string;
}

const UploadSuccessMessage: React.FC<UploadSuccessMessageProps> = ({ fileName, fileSize }) => {
  return (
    <div className="w-screen h-screen flex items-center justify-center">
      <div className="border-2 border-primaryGreen rounded-md p-10 flex flex-col items-center space-y-4 bg-white">
        <FaCheckCircle className="text-primaryGreen text-3xl" />
        <p className="text-center text-black text-lg">
          El archivo {fileName} - {fileSize}. se ha cargado correctamente
        </p>
      </div>
    </div>
  );
};

const primaryGreen = "#339933";
const borderPrimaryGreen = "border-primaryGreen";
const textPrimaryGreen = "text-primaryGreen";

export default UploadSuccessMessage;