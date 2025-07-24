import { useNavigate } from 'react-router-dom';

interface Game {
  id: string;
  title: string;
  description: string;
  route: string;
  color: string;
  players?: number;
}

const Home = () => {
  const navigate = useNavigate();
  // const { connected } = useSignalR();

  const connected = false;

  const games: Game[] = [
    {
      id: 'dot-war',
      title: 'Dot War',
      description: 'A multiplayer dot-based battle game where players compete in real-time combat.',
      route: '/dot-war',
      color: 'from-blue-500 to-purple-600',
      players: 2,
    },
  ];

  const handleGameClick = (game: Game) => {
    navigate(game.route);
  };

  return (
    <div className='container mx-auto px-4 py-16'>
      {/* Header */}
      <div className='text-center mb-16'>
        <h1 className='text-5xl font-bold text-white mb-4'>Game Hub</h1>
        <p className='text-xl text-gray-300 max-w-2xl mx-auto'>
          Choose your game and start playing with friends in real-time multiplayer experiences.
        </p>
      </div>

      {/* Games Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto'>
        {games.map((game) => (
          <button
            key={game.id}
            type='button'
            onClick={() => handleGameClick(game)}
            className='group cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl text-left p-0 bg-transparent border-none'
            style={{ all: 'unset', display: 'block' }}
            tabIndex={0}
            aria-label={`Play ${game.title}`}
          >
            <div className='relative overflow-hidden rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20'>
              {/* Game Card Background */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${game.color} opacity-20 group-hover:opacity-30 transition-opacity duration-300`}
              />

              {/* Card Content */}
              <div className='relative p-8 h-full'>
                {/* Game Icon/Emoji */}

                {game.id === 'dot-war' ? (
                  <img src='/favicon.png' alt='dot-war' />
                ) : (
                  <div className='text-4xl mb-4'>'🎮'</div>
                )}

                {/* Game Title */}
                <h3 className='text-2xl font-bold text-white mb-3'>{game.title}</h3>

                {/* Game Description */}
                <p className='text-gray-300 mb-6 leading-relaxed'>{game.description}</p>

                {/* Game Stats */}
                <div className='flex items-center justify-between'>
                  <div className='flex items-center space-x-2'>
                    <div
                      className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}
                    />
                    <span className='text-sm text-gray-300'>{connected ? 'Connected' : 'Disconnected'}</span>
                  </div>

                  {/* Play Button */}
                  <button
                    type='button'
                    className='flex items-center space-x-2 text-blue-400 group-hover:text-blue-300 transition-colors focus:outline-none'
                    aria-label='Play Now'
                  >
                    <span className='text-sm font-medium'>Play Now</span>
                    <svg
                      className='w-4 h-4 transform group-hover:translate-x-1 transition-transform'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                      aria-hidden='true'
                    >
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5l7 7-7 7' />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Hover Effect Overlay */}
              <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700' />
            </div>
          </button>
        ))}
      </div>

      {/* Coming Soon Section */}
      <div className='text-center mt-16'>
        <h2 className='text-2xl font-semibold text-white mb-4'>More Games Coming Soon</h2>
        <p className='text-gray-400'>We're working on exciting new multiplayer games. Stay tuned!</p>
      </div>
    </div>
  );
};

export default Home;
