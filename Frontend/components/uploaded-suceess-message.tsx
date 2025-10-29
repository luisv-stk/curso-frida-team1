// File: UploadSuccessMessage.tsx

import { useUploadStore } from '@/stores';
import React from 'react';
import { FaCheckCircle } from 'react-icons/fa';

const UploadSuccessMessage: React.FC = () => {
  const { files } = useUploadStore();

  return (
    <div className="w-screenflex items-center justify-center">
      <div className="rounded-md p-10 flex flex-col items-center space-y-4 bg-white">
        <FaCheckCircle className="text-primaryGreen text-3xl" />
        <p className="text-center text-black text-lg">
          El archivo {`${files[0].name} - (${(files[0].size / (1024 * 1024)).toFixed(2)} Mb)`} <br />se ha cargado correctamente
        </p>
      </div>
    </div>
  );
};

export default UploadSuccessMessage;