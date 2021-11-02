import styled from '@emotion/styled';
import { useEffect, useState } from 'react';
// import { useBoard } from '../Board/hooks/useBoard';
import { usePrevProps } from '../../../hooks/usePrevProps';
// import { pixelSize } from '../../Tile.ts';

const pixelSize = 8;
type SingleTileProps = {
  topPixels?: number;
  leftPixels?: number;
  scale: number;
  zIndex: number;
};
const SingleTile = styled.div<SingleTileProps>`
  aspect-ratio: 1;
  position: absolute;
  // width: ${pixelSize * 12.5}px;
  // height: ${pixelSize * 12.5}px;
  // margin: ${pixelSize * 1}px;
  // border-radius: ${pixelSize * 0.5}px;
  background-color: #eee4da;
  color: #776e65;
  font-weight: bold;
  text-align: center;
  // font-size: ${pixelSize * 6}px;
  // line-height: 2.1;
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
  coordinate: [number, number];
  zIndex: number;
};

export const Tile = ({ value, coordinate, zIndex }: Props) => {
  const [scale, setScale] = useState(1);
  const previousValue = usePrevProps<number>(value);
  const boardWidth = window.screen.width;
  // Highlight tile when it's new
  // OR when it's being merged to become other number
  const isNew = previousValue === undefined;
  const isMerged = previousValue !== value;
  const shouldHighlight = isNew || isMerged;

  useEffect(() => {
    if (shouldHighlight) {
      setScale(1.1);
      setTimeout(() => setScale(1), 200);
    }
  }, [shouldHighlight, scale]);

  const positionToPixels = (position: number) => {
    return (position / 4) * (boardWidth as number);
  };

  return (
    <SingleTile
      topPixels={positionToPixels(coordinate[1])}
      leftPixels={positionToPixels(coordinate[0])}
      scale={scale}
      zIndex={zIndex}
    >
      {value}
    </SingleTile>
  );
};
