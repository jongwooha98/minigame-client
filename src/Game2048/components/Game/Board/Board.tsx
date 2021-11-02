import styled from '@emotion/styled';
import { Tile, tileTotalWidth } from '../Tile';
import { TileData } from '../Tile';
import { BoardProvider } from './context/BoardContext';
import { tileCountInRow as defaultTileCount } from './styles/Board';
// import { pixelSize } from '../../Tile.ts';

const pixelSize = 8;
const BoardContainer = styled.div`
  display: flex;
  position: relative;
  // width: 200px;
  // display: grid;
  // gap: 10px;
  // grid-template-columns: repeat(4, 1fr);
  // grid-template-rows: repeat(4, 1fr);
  // grid-auto-flow: column;
`;

const TileContainer = styled.div`
  position: absolute;
  z-index: 2;
  // margin: ${pixelSize * 1}px;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
`;
const Grid = styled.div`
  width: 100%;
  height: 100%;
  display: grid;
  gap: 0.5rem;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: repeat(4, auto);
  background-color: #000;
  border: 0.5rem solid #000;
`;

const Cell = styled.div`
  aspect-ratio: 1;
  background: hotpink;
`;

type Props = {
  tiles: TileData[];
  tileCountInRow: number;
};

export const Board = ({ tiles, tileCountInRow = defaultTileCount }: Props) => {
  const containerWidth = tileTotalWidth * tileCountInRow;

  // const boardWidth = containerWidth + boardMargin;

  // render all tiles on the board
  const tileList = tiles.map(({ id, ...rest }) => {
    return <Tile key={id} zIndex={id} {...rest} />;
  });

  return (
    <BoardContainer className="board">
      <BoardProvider
        containerWidth={containerWidth}
        tileCountInRow={tileCountInRow}
      >
        <TileContainer>{tileList}</TileContainer>
        <Grid className="grid">
          {[...Array(16)].map((x, i) => (
            <Cell className={`cell-${i}`} key={i} />
          ))}
        </Grid>
      </BoardProvider>
    </BoardContainer>
  );
};
//
