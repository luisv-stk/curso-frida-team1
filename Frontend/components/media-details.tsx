// File: PhotoCard.tsx

import React from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';

interface PhotoCardProps {
  name: string;
  type: string;
  size: string;
  price: string;
  author: string;
  date: string;
  tags: string;
  imageUrl: string;
}

const PhotoCard: React.FC<PhotoCardProps> = ({ name, type, size, price, author, date, tags, imageUrl }) => {
  const placeHolderImage = 'https://placehold.co/400x400/jpg';

  return (
    <div className="flex mb-4 bg-white">
      <div className="relative w-60 h-50 mr-4">
        <img
          src={imageUrl || placeHolderImage}
          alt={name}
          className="object-cover w-full h-full"
        />
        <div className="absolute bottom-2 left-2 flex justify-center items-center w-full">
          <div className="space-x-2">
            <button className="bg-white/80 p-2 rounded-full shadow-md hover:bg-gray-100">
              <FaEdit />
            </button>
            <button className="bg-white/80 p-2 rounded-full shadow-md hover:bg-gray-100">
              <FaTrash />
            </button>
          </div>
        </div>
      </div>
      <div className="p-4 flex flex-col border border-gray-200 justify-between">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p><strong>Nombre:</strong> {name}</p>
            <p><strong>Tipo de archivo:</strong> {type}</p>
            <p><strong>Tamaño:</strong> {size}</p>
          </div>
          <div>
            <p><strong>Precio:</strong> {price}</p>
            <p><strong>Autor:</strong> {author}</p>
            <p><strong>Fecha subida:</strong> {date}</p>
          </div>
        </div>
        <div className="mt-2 border-t-2 border-gray-200 pt-2">
          <p><strong>Etiquetas descripción:</strong> {tags}</p>
        </div>
      </div>
    </div>
  );
};

export default PhotoCard;