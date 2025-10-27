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
    <div className="flex border border-gray-200 shadow-sm mb-4">
      <div className="relative w-48 h-48">
        <img
          src={imageUrl || placeHolderImage}
          alt={name}
          className="object-cover w-full h-full"
        />
        <div className="absolute bottom-2 left-2 flex space-x-2">
          <button className="bg-white p-2 rounded-full shadow-md hover:bg-gray-100">
            <FaEdit />
          </button>
          <button className="bg-white p-2 rounded-full shadow-md hover:bg-gray-100">
            <FaTrash />
          </button>
        </div>
      </div>
      <div className="p-4 flex flex-col justify-between">
        <div>
          <p><strong>Nombre:</strong> {name}</p>
          <p><strong>Tipo de archivo:</strong> {type}</p>
          <p><strong>Tamaño:</strong> {size}</p>
        </div>
        <div className="flex justify-between">
          <p><strong>Precio:</strong> {price}</p>
          <p><strong>Autor:</strong> {author}</p>
          <p><strong>Fecha subida:</strong> {date}</p>
        </div>
        <div>
          <p><strong>Etiquetas descripción:</strong> {tags}</p>
        </div>
      </div>
    </div>
  );
};

export default PhotoCard;