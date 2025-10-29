// react client component
"use client";
import React from 'react';
import Hello from './hello';
import HeaderText from './header-text';
import SearchBar from './search-bar';
import Gallery from './gallery';
import AddNewItem from './add-new-item';
import { useUploadStore } from '@/stores';
import AllMyPosts from './all-my-posts';

const MediaManager: React.FC = () => {
  const { showHello, showAddNewItem, showUploadDetails }  = useUploadStore();

  return (
    <div className="items-center">
        {showHello && <Hello />}
        {showAddNewItem && <AddNewItem />}
        {showUploadDetails && <AllMyPosts />}
        <HeaderText />
        <SearchBar />
        <Gallery />
    </div>
  );
}

export default MediaManager;