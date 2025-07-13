import type React from 'react';

interface FirstTimeGuideProps {
  onStart: () => void;
}

const FirstTimeGuide: React.FC<FirstTimeGuideProps> = ({ onStart }) => {
  return (
    <div className='flex flex-col items-center justify-center h-full w-full bg-black/90 text-white p-8'>
      <div className='max-w-4xl mx-auto text-center'>
        <h1 className='text-5xl font-bold mb-8 text-cyan-100 drop-shadow-lg'>Chào mừng đến với Dot War!</h1>

        <div className='text-xl mb-12 text-gray-300 leading-relaxed'>
          <p className='mb-4'>Đây là hướng dẫn nhanh để bạn bắt đầu chơi game:</p>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-8 mb-12'>
          {/* Movement */}
          <div className='bg-gray-800/50 rounded-xl p-6 border border-cyan-400/30'>
            <h3 className='text-2xl font-semibold mb-4 text-blue-200'>🎮 Di chuyển</h3>
            <div className='flex justify-center mb-4'>
              <div className='grid grid-cols-3 gap-2'>
                <div className='w-12 h-12 flex items-center justify-center border-2 border-cyan-400 rounded-lg bg-gray-700'>
                  <span className='text-lg font-bold'>W</span>
                </div>
                <div className='w-12 h-12 flex items-center justify-center border-2 border-cyan-400 rounded-lg bg-gray-700'>
                  <span className='text-lg font-bold'>A</span>
                </div>
                <div className='w-12 h-12 flex items-center justify-center border-2 border-cyan-400 rounded-lg bg-gray-700'>
                  <span className='text-lg font-bold'>S</span>
                </div>
                <div className='w-12 h-12 flex items-center justify-center border-2 border-cyan-400 rounded-lg bg-gray-700'>
                  <span className='text-lg font-bold'>D</span>
                </div>
              </div>
            </div>
            <p className='text-gray-300'>Sử dụng WASD để di chuyển nhân vật</p>
          </div>

          {/* Shooting */}
          <div className='bg-gray-800/50 rounded-xl p-6 border border-cyan-400/30'>
            <h3 className='text-2xl font-semibold mb-4 text-red-200'>🎯 Bắn</h3>
            <div className='flex justify-center mb-4'>
              <div className='w-16 h-20 border-2 border-red-400 rounded-lg bg-gray-700 flex items-center justify-center'>
                <span className='text-sm'>Click</span>
              </div>
            </div>
            <p className='text-gray-300'>Click chuột trái để bắn theo hướng chuột</p>
          </div>

          {/* Ultimate */}
          <div className='bg-gray-800/50 rounded-xl p-6 border border-cyan-400/30'>
            <h3 className='text-2xl font-semibold mb-4 text-purple-200'>⚡ Chiêu cuối</h3>
            <div className='flex justify-center mb-4 gap-2'>
              <div className='w-12 h-12 flex items-center justify-center border-2 border-purple-400 rounded-lg bg-gray-700'>
                <span className='text-lg font-bold'>Q</span>
              </div>
              <div className='w-20 h-12 flex items-center justify-center border-2 border-purple-400 rounded-lg bg-gray-700'>
                <span className='text-sm font-bold'>Space</span>
              </div>
            </div>
            <p className='text-gray-300'>Nhấn Q hoặc Space để dùng chiêu cuối</p>
          </div>
        </div>

        <div className='bg-blue-900/30 rounded-xl p-6 border border-blue-400/30 mb-8'>
          <h3 className='text-2xl font-semibold mb-4 text-blue-200'>🎯 Mục tiêu</h3>
          <p className='text-gray-300 text-lg leading-relaxed'>
            Sống sót càng lâu càng tốt! Tiêu diệt các bot và thu thập power-ups để tăng sức mạnh. Mỗi wave sẽ khó hơn
            với nhiều bot hơn và boss xuất hiện từ wave 5.
          </p>
        </div>

        <button
          className='py-4 px-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl text-2xl font-bold transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/30 transform hover:scale-105'
          onClick={onStart}
        >
          🚀 Bắt đầu chơi ngay!
        </button>
      </div>
    </div>
  );
};

export default FirstTimeGuide;
