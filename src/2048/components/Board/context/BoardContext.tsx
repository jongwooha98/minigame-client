import { createContext } from 'react';
import { tileCount as defaultTileCount } from '../index';

export const BoardContext = createContext({
  containerWidth: 0,
  tileCount: defaultTileCount,
});

type Props = {
  containerWidth: number;
  tileCount: number;
  children: any;
};

export const BoardProvider = ({
  children,
  containerWidth = 0,
  tileCount = defaultTileCount,
}: Props) => {
  return (
    <BoardContext.Provider value={{ containerWidth, tileCount }}>
      {children}
    </BoardContext.Provider>
  );
};
