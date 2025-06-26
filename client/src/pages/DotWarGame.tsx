import GameCanvas from '@/components/dot-war/GameCanvas';

const DotWarGame = () => {
  return (
    <div className='w-full h-screen flex items-center justify-center bg-gray-900'>
      <GameCanvas />
    </div>
  );
};

export default DotWarGame;
