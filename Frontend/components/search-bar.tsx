// File: SearchBar.js

import React from 'react';
import { FaChevronDown, FaSearch } from 'react-icons/fa';

const SearchBar = () => {
    return (
        <div className="w-screen p-12 flex justify-center items-center bg-gradient-to-r from-teal-500 to-blue-700">
            <div className="flex items-center bg-white shadow-md rounded-md overflow-hidden">
                <button className="flex items-center justify-between px-4 py-2 border-r border-gray-300">
                    <span>Todos</span>
                    <FaChevronDown className="ml-2" />
                </button>
                <input 
                    type="text" 
                    placeholder="Buscar" 
                    className="flex-grow px-4 py-2 focus:outline-none min-w-2xl"
                />
                <button className="px-4 py-2">
                    <FaSearch />
                </button>
            </div>
        </div>
    );
};

export default SearchBar;