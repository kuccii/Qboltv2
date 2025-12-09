import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navigation from './Navigation';
import MobileNavigation from './MobileNavigation';
import BottomTabNavigation from './BottomTabNavigation';

const Layout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation 
        onMobileMenuToggle={toggleMobileMenu}
        mobileMenuOpen={mobileMenuOpen}
      />
      
      <MobileNavigation 
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      {/* Main content */}
      <main className="flex-1 pb-16 lg:pb-0">
        <Outlet />
      </main>

      {/* Bottom Tab Navigation for Mobile - Hide when mobile menu is open */}
      {!mobileMenuOpen && (
        <BottomTabNavigation onMoreClick={toggleMobileMenu} />
      )}
    </div>
  );
};

export default Layout;