import { useEffect, useRef, useState } from 'react';
import GameCanvas from './GameCanvas';
import { connection } from './signalr';
import { Button } from './components/ui/button';
import * as signalR from '@microsoft/signalr';

function App() {
  const [connected, setConnected] = useState(false);
  const [message, setMessage] = useState('');
  const playerRef = useRef({
    x: 1,
    y: 3,
    direction: 'left'
  });

  useEffect(() => {
    if (connection.state === signalR.HubConnectionState.Disconnected) {
      connection
        .start()
        .then(() => {
          console.log('connected');
          setConnected(true);

          connection.on('Pong', () => {
            setMessage('received');
          });
        })
        .catch((err) => {
          console.error('❌ SignalR connection failed:', err);
        });
    }

    return () => {
      connection.off('Pong');
    };
  }, []);

  const sendPing = async () => {
    try {
      await connection.invoke('Ping');
      console.log('📤 Ping sent');
    } catch (err) {
      console.error('❌ Ping failed:', err);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (connection.state === signalR.HubConnectionState.Connected && playerRef.current) {
        connection.invoke('UpdatePlayerState', playerRef.current);
      }
    }, 50);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className='w-full h-screen flex items-center justify-center bg-gray-900'>
      <GameCanvas />
    </div>
  );
}

export default App;
