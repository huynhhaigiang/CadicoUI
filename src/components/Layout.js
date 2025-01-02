import React from 'react';
import Navigation from './Navigation';
import TopBar from './TopBar';
import { Outlet } from 'react-router-dom';

const Layout = () => {
  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg fixed h-screen overflow-y-auto">
        <Navigation />
      </aside>

      {/* Nội dung chính và TopBar */}
      <div className="flex flex-col flex-grow ml-64">
        {/* TopBar */}
        <header className="fixed top-0 left-64 right-0 z-10">
          <TopBar />
        </header>

        {/* Nội dung chính */}
        <main className="flex-grow p-6 bg-gray-100 overflow-auto mt-16">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
