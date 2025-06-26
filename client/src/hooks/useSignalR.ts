import { connection } from '@/signalr';
import * as signalR from '@microsoft/signalr';
import { useEffect, useRef, useState } from 'react';

interface PlayerState {
  x: number;
  y: number;
  direction: string;
}

export const useSignalR = () => {
  const [connected, setConnected] = useState(false);
  const [message, setMessage] = useState('');
  const playerRef = useRef<PlayerState>({
    x: 1,
    y: 3,
    direction: 'left'
  });

  // Initialize SignalR connection
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

  // Send ping message
  const sendPing = async () => {
    try {
      await connection.invoke('Ping');
      console.log('📤 Ping sent');
    } catch (err) {
      console.error('❌ Ping failed:', err);
    }
  };

  // Update player state periodically
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     if (connection.state === signalR.HubConnectionState.Connected && playerRef.current) {
  //       connection.invoke('UpdatePlayerState', playerRef.current);
  //     }
  //   }, 50);

  //   return () => clearInterval(interval);
  // }, []);

  return {
    connected,
    message,
    sendPing,
    playerRef
  };
}; 