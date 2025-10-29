
import React from 'react';
import { FaClock, FaCheck } from 'react-icons/fa';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useUploadStore } from '@/stores';


const Hello: React.FC = () => {
  const { displayAddNewItem, displayUploadDetails, clearAllFiles } = useUploadStore();
  
  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
  const capitalizeLongWords = (s: string) =>
    s
      .split(' ')
      .map(w => (w.length > 2 ? w.charAt(0).toUpperCase() + w.slice(1) : w))
      .join(' ');

  const formatted = capitalizeLongWords(
    format(twoHoursAgo, "EEEE d 'de' MMMM HH:mm'h'", { locale: es })
  );

  return (
    <div className="w-screen p-8 bg-[#f5f9fd] flex justify-center items-center">
      <div className="p-8 rounded-lg w-full">
        <div className="flex justify-between items-start mb-6">
          <div className="text-[#ee28ff] flex items-center space-x-2">
            <FaClock />
            <span>
              Ultima conexión: <span className="text-[#ee28ff]">{formatted}</span>
            </span>
          </div>
          <button className="text-[#0179ff] flex items-center space-x-1 cursor-pointer" onClick={displayAddNewItem}>
            <FaCheck />
            <span>Cerrar</span>
          </button>
        </div>
        <div className="text-left">
          <h2 className="text-black font-bold mb-2">Hola Karinne,</h2>
          <p className="text-black">
            Bienvenida de vuelta, en estos momentos tienes publicadas:
          </p>
          <ul className="list-disc text-black pl-5 mt-2 mb-4">
            <li>36 fotos</li>
            <li>24 vídeos</li>
            <li>12 ilustraciones</li>
          </ul>
        </div>
        <div className="flex justify-center space-x-4">
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
      </div>
    </div>
  );
};

export default Hello;