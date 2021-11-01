import { useGame } from './hooks/useGame';
import { useThrottledCallback } from 'use-debounce';
import { animationDuration, Board, tileCount } from '../Board';
import { useEffect } from 'react';

export const Game = () => {
  const [tiles, moveLeft, moveRight, moveUp, moveDown] = useGame();

  const handleKeyDown = (e: KeyboardEvent) => {
    e.preventDefault();

    switch (e.code) {
      case 'ArrowLeft':
        moveLeft();
        break;
      case 'ArrowRight':
        moveRight();
        break;
      case 'ArrowUp':
        moveUp();
        break;
      case 'ArrowDown':
        moveDown();
        break;
    }
  };

  const throttleHandleKeyDown = useThrottledCallback(
    handleKeyDown,
    animationDuration,
    { leading: true, trailing: false }
  );

  useEffect(() => {
    window.addEventListener('keydown', throttleHandleKeyDown);

    return () => {
      window.removeEventListener('keydown', throttleHandleKeyDown);
    };
  }, [throttleHandleKeyDown]);

  return <Board tiles={tiles} tileCountPerRow={tileCount} />;
};
