// File: AddNewItem.tsx

import React from 'react';
import { useState } from 'react';
import { FaArrowLeft, FaCheck } from 'react-icons/fa';

import UploadSuccessMessage from './uploaded-suceess-message';
import UploadProgress from './upload-progress';
import { DropzoneComponent } from './drop-zone';
import { useUpload, useUploadStore } from '@/stores';
import { cn } from '@/lib/utils';

const AddNewItem: React.FC = () => {
  const [fileType, setFileType] = useState<string>('Fotografía');
  const { uploadFile } = useUpload();
  const { files, isUploading, totalProgress, hideAddNewItem, displayAddNewItem, displayUploadDetails, clearAllFiles  } = useUploadStore();

  return (
    <div>
      
      <div className="w-screen flex justify-center items-center bg-[#f5f9fd] text-[#131313]">
        <div className=" p-8 rounded-lg w-full">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center text-[#0179ff]">
              <FaArrowLeft className="mr-2" />
              <span className="font-bold">Añadir nuevo elemento</span>
            </div>
            <div className="text-[#0276ff] flex items-center cursor-pointer" onClick={() => {
              hideAddNewItem();
              clearAllFiles();
              }}>
              <FaCheck className="mr-2" />
              <span>Cerrar</span>
            </div>
          </div>

          {!isUploading &&(<div>
            <div className="mb-4">
              <h2 className="font-bold mb-4">Datos del archivo</h2>
              <div className="flex space-x-8 mb-4">
                {['Fotografía', 'Vídeo', 'Ilustración', '3D'].map((type) => (
                  <label key={type} className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="fileType"
                      value={type}
                      checked={fileType === type}
                      onChange={() => setFileType(type)}
                      className="mr-2 bg-white"
                    />
                    {type}
                  </label>
                ))}
              </div>

              <div className="flex space-x-4 mb-8">
                <div className="flex-1">
                  <label className="block text-sm mb-1">Título</label>
                  <input
                    type="text"
                    className="w-full border border-[#0179ff] rounded p-2 outline-none focus:outline-none bg-white"
                    placeholder="Introduzca el título"
                  />
                </div>

                <div className="w-24">
                  <label className="block text-sm mb-1">Precio</label>
                  <div className="flex items-center border border-[#0179ff] rounded">
                    <input
                      type="number"
                      className="w-full p-2 outline-none focus:outline-none bg-white"
                      placeholder="0"
                    />
                    <span className="p-2">€</span>
                  </div>
                </div>
              </div>
            </div>

            <div className={cn(
              "border-dashed border-2 border-[#0276ff] flex items-center justify-center relative bg-white rounded-lg",
              "",
              {
                "border-solid border-green-600": totalProgress === 100,
              }
            )}>
              <div className="w-full flex flex-col items-center justify-center">
                {totalProgress === 0 && 
                  <DropzoneComponent />
                }
                {totalProgress > 0 && <UploadSuccessMessage />}
              </div>
            </div>
            

            {totalProgress === 0 && 
              <div className="flex justify-center mt-4 space-x-4">
                <button className={cn("px-4 py-2 border border-[#d9d9d9] text-[#6f7274] bg-[#f5f9fd] rounded-3xl cursor-pointer", "", {
                  'bg-slate-500 text-white border-0': files.length > 0
                })}
                  onClick={clearAllFiles}
                >
                  Borrar
                </button>
                <button className={cn("px-4 py-2 bg-[#d9d9d9] text-[#6f7274] rounded-3xl cursor-pointer","", {
                  'bg-[#0276ff] text-white': files.length > 0
                })}
                  onClick={() => {
                    if (files.length > 0) {
                      uploadFile(files[0].id, files[0].file);
                    }}}
                >
                  Cargar archivo
                </button>
              </div>
            }
            {totalProgress > 0 &&
              <div className="flex justify-center mt-4 space-x-4">
                <button className="border border-[#0179ff] text-[#0179ff] cursor-pointer px-4 py-2 rounded-full" onClick={displayUploadDetails}>
                  Ver todas tus publicaciones
                </button>
                <button className="bg-[#0179ff] text-white px-4 py-2 cursor-pointer rounded-full" onClick={() => {
                  displayAddNewItem();
                  clearAllFiles();
                }}>
                  Añadir nuevo elemento
                </button>
              </div>
            }
          </div>)}
          {isUploading && 
            <div>
              <UploadProgress />
              <div className="flex justify-center mt-4 space-x-4">
                <button className="bg-[#0179ff] text-white px-4 py-2 cursor-pointer rounded-full" onClick={() => {
                  clearAllFiles();
                }}>
                  Cancelar
                </button>
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  );
};

export default AddNewItem;