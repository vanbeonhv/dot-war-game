import { useEffect, useState } from 'react';
import GameCanvas from '@/components/dot-war/core/GameCanvas';
import DotWarGuide from '@/components/dot-war/ui/DotWarGuide';
import DotWarMenu from '@/components/dot-war/ui/DotWarMenu';
import FirstTimeGuide from '@/components/dot-war/ui/FirstTimeGuide';

const DotWarGame = () => {
  const [screen, setScreen] = useState<'menu' | 'guide' | 'game' | 'firstTime'>('menu');
  const [hasSeenFirstTimeGuide, setHasSeenFirstTimeGuide] = useState(false);

  // Game frame size
  const frameW = 800;
  const frameH = 600;

  // Check sessionStorage on component mount
  useEffect(() => {
    const hasSeen = sessionStorage.getItem('dotWarFirstTimeGuide') === 'true';
    setHasSeenFirstTimeGuide(hasSeen);

    // If first time, show first time guide instead of menu
    if (!hasSeen) {
      setScreen('firstTime');
    }
  }, []);

  const handleStartGame = () => {
    // Mark first time guide as seen
    if (!hasSeenFirstTimeGuide) {
      sessionStorage.setItem('dotWarFirstTimeGuide', 'true');
      setHasSeenFirstTimeGuide(true);
    }
    setScreen('game');
  };

  const handleStartFromMenu = () => {
    // If first time, show first time guide
    if (!hasSeenFirstTimeGuide) {
      setScreen('firstTime');
    } else {
      setScreen('game');
    }
  };

  return (
    <div className='w-full h-screen flex items-center justify-center bg-gray-900'>
      <div
        className='relative flex items-center justify-center border-4 border-gray-700 rounded-xl shadow-2xl bg-[#22223b]'
        style={{ width: frameW, height: frameH }}
      >
        {screen === 'menu' && (
          <div className='absolute inset-0 z-10 flex items-center justify-center bg-black/70 rounded-xl'>
            <DotWarMenu onStart={handleStartFromMenu} onGuide={() => setScreen('guide')} />
          </div>
        )}
        {screen === 'guide' && (
          <div className='absolute inset-0 z-20 flex items-center justify-center bg-black/80 rounded-xl'>
            <DotWarGuide onBack={() => setScreen('menu')} />
          </div>
        )}
        {screen === 'firstTime' && (
          <div className='absolute inset-0 z-30 flex items-center justify-center bg-black/90 rounded-xl'>
            <FirstTimeGuide onStart={handleStartGame} />
          </div>
        )}
        {screen === 'game' && <GameCanvas />}
      </div>
    </div>
  );
};

export default DotWarGame;
