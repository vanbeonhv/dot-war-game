import type React from 'react';

interface DotWarGuideProps {
  onBack: () => void;
}

const DotWarGuide: React.FC<DotWarGuideProps> = ({ onBack }) => {
  return (
    <div className='flex flex-col items-center justify-center h-full w-full bg-gray-900 text-white'>
      <h2 className='text-4xl font-bold mb-12 text-cyan-100 drop-shadow-lg'>Hướng dẫn</h2>

      <div className='grid grid-cols-2 gap-16 mb-12 w-full max-w-5xl px-4'>
        {/* Movement Section */}
        <div className='flex flex-col items-center'>
          <h3 className='text-xl font-semibold mb-8 text-blue-200 drop-shadow-lg'>Di chuyển</h3>
          <div className='relative w-[280px] h-[280px]'>
            {/* WASD keys */}
            <div className='absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2'>
              <div className='flex flex-col items-center gap-2'>
                <div className='w-16 h-16 flex items-center justify-center border-2 border-cyan-400 rounded-xl bg-gray-800/90 shadow-lg hover:shadow-cyan-400/20 transition-all duration-200 hover:scale-105'>
                  <span className='text-3xl font-bold text-white drop-shadow-lg'>W</span>
                </div>
                <div className='flex gap-2'>
                  <div className='w-16 h-16 flex items-center justify-center border-2 border-cyan-400 rounded-xl bg-gray-800/90 shadow-lg hover:shadow-cyan-400/20 transition-all duration-200 hover:scale-105'>
                    <span className='text-3xl font-bold text-white drop-shadow-lg'>A</span>
                  </div>
                  <div className='w-16 h-16 flex items-center justify-center border-2 border-cyan-400 rounded-xl bg-gray-800/90 shadow-lg hover:shadow-cyan-400/20 transition-all duration-200 hover:scale-105'>
                    <span className='text-3xl font-bold text-white drop-shadow-lg'>S</span>
                  </div>
                  <div className='w-16 h-16 flex items-center justify-center border-2 border-cyan-400 rounded-xl bg-gray-800/90 shadow-lg hover:shadow-cyan-400/20 transition-all duration-200 hover:scale-105'>
                    <span className='text-3xl font-bold text-white drop-shadow-lg'>D</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Combat Section */}
        <div className='flex flex-col items-center'>
          <h3 className='text-xl font-semibold mb-8 text-blue-200 drop-shadow-lg'>Tấn công</h3>
          <div className='flex flex-col items-center gap-8'>
            {/* Mouse */}
            <div className='w-40 h-52 border-2 border-cyan-400 rounded-3xl bg-gray-800/90 p-4 flex flex-col items-center'>
              <div className='w-full flex gap-2 mb-4'>
                <div className='flex-1 h-10 border-2 border-cyan-400 bg-cyan-400/40 rounded-md flex items-center justify-center text-sm font-semibold shadow-lg cursor-pointer hover:bg-cyan-400/50 transition-all active:scale-95'>
                  Trái
                </div>
                <div className='flex-1 h-10 border border-cyan-400/10 bg-gray-800/10 rounded-md flex items-center justify-center text-sm font-semibold text-cyan-300/20'>
                  <span className='opacity-50'>Phải</span>
                </div>
              </div>
              <div className='w-20 h-24 border-2 border-cyan-400 rounded-2xl bg-gray-800/50 relative'>
                <div className='absolute top-0 left-1/2 -translate-x-1/2 w-3 h-5 border-2 border-cyan-400 rounded-full'></div>
              </div>
              <div className='mt-auto text-sm text-cyan-300/90'>Nhấn trái để bắn</div>
            </div>

            {/* Ultimate Skill Keys */}
            <div className='flex flex-col items-center gap-4'>
              <div className='flex gap-2'>
                <div className='w-16 h-16 flex items-center justify-center border-2 border-cyan-400 rounded-xl bg-gray-800/90 shadow-lg hover:shadow-cyan-400/20 transition-all duration-200 hover:scale-105'>
                  <span className='text-2xl font-bold text-white'>Q</span>
                </div>
                <div className='w-48 h-16 flex items-center justify-center border-2 border-cyan-400 rounded-xl bg-gray-800/90 shadow-lg hover:shadow-cyan-400/20 transition-all duration-200 hover:scale-105'>
                  <span className='text-xl font-bold text-white tracking-wider'>Space</span>
                </div>
              </div>
              <div className='text-sm text-cyan-300/90'>Nhấn để dùng chiêu cuối</div>
            </div>
          </div>
        </div>
      </div>

      <button
        className='py-3 px-8 bg-blue-600 hover:bg-blue-700 rounded-lg text-lg font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/20'
        onClick={onBack}
      >
        Quay lại
      </button>
    </div>
  );
};

export default DotWarGuide;
