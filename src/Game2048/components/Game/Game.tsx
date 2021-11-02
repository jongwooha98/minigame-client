import { useGame } from './hooks/useGame';
import { useThrottledCallback } from 'use-debounce';
// import { Board, tileCount } from '';
import { Board, tileCountInRow } from './Board';
import { animationDuration } from './Tile';
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

  return <Board tiles={tiles} tileCountInRow={tileCountInRow} />;
};
