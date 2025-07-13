import type React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { DOT_WAR_VERSION } from './dot-war/constants/constants';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  const handleHomeClick = () => {
    navigate('/');
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900'>
      {/* Fixed Topbar */}
      <div className='fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-md border-b border-white/10'>
        <div className='container mx-auto px-4'>
          <div className='flex items-center justify-between h-16'>
            {/* Logo/Home Button */}
            <button onClick={handleHomeClick} className='flex items-center space-x-3 cursor-pointer group'>
              <div className='w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center'>
                <span className='text-white font-bold text-lg'>G</span>
              </div>
              <span className='text-white font-semibold text-lg group-hover:text-blue-300 transition-colors'>
                Game Hub
              </span>
            </button>

            {/* Navigation */}
            <div className='flex items-center space-x-4'>
              {!isHomePage && (
                <button
                  onClick={handleHomeClick}
                  className='flex items-center space-x-2 px-4 py-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200'
                >
                  <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24' aria-hidden='true'>
                    <title>Home</title>
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6'
                    />
                  </svg>
                  <span>Back to Games</span>
                </button>
              )}

              {/* Current Page Indicator */}
              {!isHomePage && (
                <div className='flex items-center space-x-2 text-gray-400'>
                  <span className='text-sm'>Playing:</span>
                  <span className='text-sm font-medium text-white'>
                    {location.pathname === '/dot-war' ? 'Dot War' : 'Game'} {DOT_WAR_VERSION}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content with Topbar Spacing */}
      <div className='pt-16'>{children}</div>
    </div>
  );
};

export default Layout;
