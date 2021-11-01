import styled from '@emotion/styled';
import { useEffect, useState } from 'react';
import { useBoard } from '../Board/hooks/useBoard';
import { usePrevProps } from '../../hooks/usePrevProps';
import { pixelSize } from '../../styles';

type SingleTileProps = {
  topPixels: number;
  leftPixels: number;
  scale: number;
  zIndex: number;
};
const SingleTile = styled.div<SingleTileProps>`
  position: absolute;
  width: ${pixelSize * 12.5}px;
  height: ${pixelSize * 12.5}px;
  margin: ${pixelSize * 1}px;
  border-radius: ${pixelSize * 0.5}px;
  background-color: #eee4da;
  color: #776e65;
  font-weight: bold;
  text-align: center;
  font-size: ${pixelSize * 6}px;
  line-height: 2.1;
  transition-property: left, top, transform;
  transition-duration: 250ms, 250ms, 100ms;
  transform: scale(1);

  top: ${(props) => props.topPixels}px;
  left: ${(props) => props.leftPixels}px;
  transform: scale(${(props) => props.scale});
  z-index: ${(props) => props.zIndex};
`;

type Props = {
  value: number;
  position: [number, number];
  zIndex: number;
};

export const Tile = ({ value, position, zIndex }: Props) => {
  const [containerWidth, tileCount] = useBoard();

  const [scale, setScale] = useState(1);

  const previousValue = usePrevProps<number>(value);

  // check if tile is within the board boundaries
  const withinBoardBoundaries =
    position[0] < tileCount && position[1] < tileCount;
  if (!withinBoardBoundaries) {
    throw new Error('tile is out of boundaries of 4x4 grid');
  }
  // if it is a new tile :
  const isNew = previousValue === undefined;
  //
  const hasChanged = previousValue !== value;
  //
  const shallHighlight = isNew || hasChanged;

  useEffect(() => {
    if (shallHighlight) {
      setScale(1.1);
      setTimeout(() => setScale(1), 100);
    }
  }, [shallHighlight, scale]);

  const positionToPixels = (position: number) => {
    return (position / tileCount) * (containerWidth as number);
  };

  // const style = {
  //   top: positionToPixels(position[1]),
  //   left: positionToPixels(position[0]),
  //   transform: `scale(${scale})`,
  //   zIndex,
  // };

  return (
    <SingleTile
      topPixels={positionToPixels(position[1])}
      leftPixels={positionToPixels(position[0])}
      scale={scale}
      zIndex={zIndex}
    >
      {value}
    </SingleTile>
  );
};
