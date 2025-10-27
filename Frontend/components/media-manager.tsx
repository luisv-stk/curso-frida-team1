// react client component
"use client";
import React from 'react';
import Hello from './hello';
import HeaderText from './header-text';
import SearchBar from './search-bar';
import Gallery from './gallery';
import AddNewItem from './add-new-item';
import { useUploadStore } from '@/stores';

const MediaManager: React.FC = () => {
  const { showHello, showAddNewItem }  = useUploadStore();

  return (
    <div className="items-center">
        {showHello && <Hello />}
        {showAddNewItem && <AddNewItem />}
        <HeaderText />
        <SearchBar />
        <Gallery />
    </div>
  );
}

export default MediaManager;