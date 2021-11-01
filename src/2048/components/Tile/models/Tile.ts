import { pixelSize } from '../../../styles';

export type TileMeta = {
  id: number;
  position: [number, number];
  value: number;
  mergeWidth?: number;
};

const tileMargin = 2 * pixelSize;

const tilWidthMultiplier = 12.5;

const tileWidth = tilWidthMultiplier * pixelSize;

export const tileTotalWidth = tileWidth + tileMargin;
