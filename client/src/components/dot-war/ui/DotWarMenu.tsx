import type React from 'react';

interface DotWarMenuProps {
  onStart: () => void;
  onGuide: () => void;
}

const DotWarMenu: React.FC<DotWarMenuProps> = ({ onStart, onGuide }) => {
  return (
    <div className='flex flex-col items-center justify-center h-full w-full bg-gray-900 text-white'>
      <h1 className='text-4xl font-bold mb-8'>Dot War</h1>
      <div className='flex flex-col gap-4 w-64'>
        <button
          className='py-3 px-6 bg-blue-600 hover:bg-blue-700 rounded text-lg font-semibold transition'
          onClick={onStart}
        >
          Bắt đầu
        </button>
        <button
          className='py-3 px-6 bg-gray-700 hover:bg-gray-800 rounded text-lg font-semibold transition'
          onClick={onGuide}
        >
          Hướng dẫn
        </button>
      </div>
    </div>
  );
};

export default DotWarMenu;
