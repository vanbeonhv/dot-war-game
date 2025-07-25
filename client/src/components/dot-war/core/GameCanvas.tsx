import Phaser from 'phaser';
import type React from 'react';
import { useEffect, useRef } from 'react';
import GameScene from './GameScene';

const GameCanvas: React.FC = () => {
  const gameRef = useRef<HTMLDivElement>(null);
  const gameInstance = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (gameRef.current && !gameInstance.current) {
      const config: Phaser.Types.Core.GameConfig = {
        type: Phaser.AUTO,
        width: 800,
        height: 600,
        parent: gameRef.current,
        scene: GameScene,
        backgroundColor: '#22223b',
      };
      gameInstance.current = new Phaser.Game(config);
    }
    return () => {
      if (gameInstance.current) {
        gameInstance.current.destroy(true);
        gameInstance.current = null;
      }
    };
  }, []);

  return <div ref={gameRef} />;
};

export default GameCanvas;
