import { useState } from 'react';
import DotWarGuide from '@/components/dot-war/DotWarGuide';
import DotWarMenu from '@/components/dot-war/DotWarMenu';
import GameCanvas from '@/components/dot-war/GameCanvas';

const DotWarGame = () => {
  const [screen, setScreen] = useState<'menu' | 'guide' | 'game'>('menu');

  // Game frame size
  const frameW = 800;
  const frameH = 600;

  return (
    <div className='w-full h-screen flex items-center justify-center bg-gray-900'>
      <div
        className='relative flex items-center justify-center border-4 border-gray-700 rounded-xl shadow-2xl bg-[#22223b]'
        style={{ width: frameW, height: frameH }}
      >
        {screen === 'menu' && (
          <div className='absolute inset-0 z-10 flex items-center justify-center bg-black/70 rounded-xl'>
            <DotWarMenu onStart={() => setScreen('game')} onGuide={() => setScreen('guide')} />
          </div>
        )}
        {screen === 'guide' && (
          <div className='absolute inset-0 z-20 flex items-center justify-center bg-black/80 rounded-xl'>
            <DotWarGuide onBack={() => setScreen('menu')} />
          </div>
        )}
        {screen === 'game' && <GameCanvas />}
      </div>
    </div>
  );
};

export default DotWarGame;
