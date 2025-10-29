import React from 'react';
import { FaArrowLeft, FaCheck } from 'react-icons/fa';

import { UploadedFile, useUploadStore } from '@/stores';
import PhotoCard from './media-details';

const placeholderImage = 'https://placehold.co/400x400/jpg';

const AllMyPosts: React.FC = () => {
  const { uploadedFiles, displayAddNewItem, hideUploadDetails  } = useUploadStore();

  const images = (uploadedFiles ?? []).map((f: UploadedFile) => ({
      ...f,
      src: f.uploadedUrl || placeholderImage,
    }));

  return (
    <div className="w-screen flex justify-center items-center bg-[#f5f9fd] text-[#131313]">
        <div className=" p-8 rounded-lg w-full">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center">
              <FaArrowLeft className="mr-2 text-[#0179ff]" />
              <span className="font-bold text-black">Todas mis publicaciones</span>
            </div>
            <div className="text-[#0276ff] flex items-center cursor-pointer" onClick={() => {
              hideUploadDetails();
              displayAddNewItem();
              }}>
              <FaCheck className="mr-2" />
              <span>Cerrar</span>
            </div>
            </div>
            <div className="grid grid-cols-2 gap-4 bg-white p-4">

                {images.map((image) => (
                    <PhotoCard 
                        key={image.id}
                        name={image.name}
                        type={image.format}
                        size={image.size.width ?`${image.size.width}x${image.size.height}px` : ''}
                        price="Free"
                        author={image.author || ''}
                        date={image.upload_date ? image.upload_date.toDateString() : ''}
                        tags={image.tags.join(', ')}
                        imageUrl={image.src}
                    />
                ))}
            </div>
        </div>
      </div>
  );
};

export default AllMyPosts;