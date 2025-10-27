import React from 'react';
import { FaCamera, FaVideo } from 'react-icons/fa';

const placeholderImage = 'https://placehold.co/400x400/jpg';

const Gallery: React.FC = () => {
  const images = [
    { id: 1, icon: <FaCamera />, src: placeholderImage },
    { id: 2, icon: <FaVideo />, src: placeholderImage },
    { id: 3, icon: <FaCamera />, src: placeholderImage },
    { id: 4, icon: <FaCamera />, src: placeholderImage },
    { id: 5, icon: <FaCamera />, src: placeholderImage },
    { id: 6, icon: <FaCamera />, src: placeholderImage },
    { id: 7, icon: <FaVideo />, src: placeholderImage },
    { id: 8, icon: <FaCamera />, src: placeholderImage },
  ];

  return (
    <div className="w-screen h-screen max-w-7xl mx-auto bg-white">
      <div className="flex justify-center space-x-4 py-4">
        {['Inicio', 'Fotos', 'Videos', 'Ilustraciones', '3D'].map((item) => (
          <button
            key={item}
            className="bg-white text-black px-4 py-2 rounded-full hover:bg-gray-200"
          >
            {item}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-4 p-10">
        {images.map((image) => (
          <div key={image.id} className="relative">
            <img
              src={image.src}
              alt={`Gallery image ${image.id}`}
              className="rounded-lg"
            />
            <div className="absolute top-2 right-2 text-white bg-black rounded-full p-2">
              {image.icon}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Gallery;