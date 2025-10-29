// File: PhotoComponent.js

import React from 'react';
import { FaCamera } from 'react-icons/fa';

const PhotoComponent = () => {
  return (
    <div className="w-screen h-screen flex items-center justify-center bg-d9d9d9">
      <div className="relative">
        <img 
          src="https://placehold.co/400x400/jpg" 
          alt="Person" 
          className="w-80 h-80 object-cover rounded-lg" 
        />
        <button 
          className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-md flex items-center justify-center">
          <FaCamera className="text-2xl text-black"/>
        </button>
      </div>
    </div>
  );
};

export default PhotoComponent;