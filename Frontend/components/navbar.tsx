// File: Navbar.tsx
"use client";

import React from 'react';
import { useState } from 'react';
import { FiCheck } from 'react-icons/fi';
import { FaCaretDown } from 'react-icons/fa';

const Navbar: React.FC = () => {
  const [languageDropdownOpen, setLanguageDropdownOpen] = useState(false);
  const [exploreDropdownOpen, setExploreDropdownOpen] = useState(false);

  return (
    <div className="w-full h-16 bg-white flex items-center justify-between px-6 shadow">
      <div className="flex items-center">
        <div className="flex items-center mr-4">
          <div className="w-5 h-5 bg-blue-600 rounded border-1 border-black"></div>
          <span className="ml-2 font-bold text-lg">
            Photo<span className="text-blue-600">blue</span>
          </span>
        </div>
        
      </div>
      <div className="flex items-center">
        <button className="bg-pink-500 text-white rounded-lg px-4 py-1 flex items-center mr-4 cursor-pointer">
          <FiCheck className="mr-1" />
          Nuevas funciones
        </button>
        <div className="relative mr-3">
          <button
            className="flex items-center"
            onClick={() => setLanguageDropdownOpen(!languageDropdownOpen)}
          >
            Idioma <FaCaretDown className="ml-1" />
          </button>
          {languageDropdownOpen && (
            <ul className="absolute top-6 left-0 mt-1 w-24 bg-white shadow rounded overflow-hidden">
              <li className="p-2 hover:bg-gray-100 cursor-pointer">Español</li>
              <li className="p-2 hover:bg-gray-100 cursor-pointer">English</li>
            </ul>
          )}
        </div>
        <div className="relative mr-3">
          <button
            className="flex items-center"
            onClick={() => setExploreDropdownOpen(!exploreDropdownOpen)}
          >
            Explorar <FaCaretDown className="ml-1" />
          </button>
          {exploreDropdownOpen && (
            <ul className="absolute top-6 left-0 mt-1 w-24 bg-white shadow rounded overflow-hidden">
              <li className="p-2 hover:bg-gray-100 cursor-pointer">Galería</li>
              <li className="p-2 hover:bg-gray-100 cursor-pointer">Tendencias</li>
            </ul>
          )}
        </div>
        <button className="mr-3">Ayuda</button>
        <button className="border-2 border-blue-500 text-blue-500 rounded-full px-4 py-1 mr-3 cursor-pointer">
          Cerrar sesión
        </button>
        <img
          className="w-8 h-8 rounded-full"
          src="https://placehold.co/400x400/jpg"
          alt="user profile"
        />
      </div>
    </div>
  );
};

export default Navbar;