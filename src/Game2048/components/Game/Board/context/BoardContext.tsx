import { createContext } from 'react';
import { tileCountInRow as defaultTileCount } from '../styles/Board';

export const BoardContext = createContext({
  containerWidth: 0,
  tileCountInRow: defaultTileCount,
});

type Props = {
  containerWidth: number;
  tileCountInRow: number;
  children: any;
};

export const BoardProvider = ({
  children,
  containerWidth = 0,
  tileCountInRow = defaultTileCount,
}: Props) => {
  return (
    <BoardContext.Provider value={{ containerWidth, tileCountInRow }}>
      {children}
    </BoardContext.Provider>
  );
};
