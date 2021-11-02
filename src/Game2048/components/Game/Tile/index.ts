export * from './styles/Tile';
export * from './index';
export { Tile } from './Tile';

export type TileData = {
  id: number;
  coordinate: [number, number];
  value: number;
  mergeWith?: number;
};
