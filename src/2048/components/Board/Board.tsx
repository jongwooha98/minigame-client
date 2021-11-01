import styled from '@emotion/styled';
import { Tile, TileMeta, tileTotalWidth } from '../Tile';
import { BoardProvider } from './context/BoardContext';
import { tileCount as defaultTileCount, boardMargin } from './models/Board';
import { Grid } from '../Grid';
import { pixelSize } from '../../styles';

const Container = styled.div`
  position: relative;
`;

const TileContainer = styled.div`
  position: absolute;
  z-index: 2;
  margin: ${pixelSize * 1}px;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
`;
type Props = {
  tiles: TileMeta[];
  tileCountPerRow: number;
};

export const Board = ({ tiles, tileCountPerRow = defaultTileCount }: Props) => {
  const containerWidth = tileTotalWidth * tileCountPerRow;

  const boardWidth = containerWidth + boardMargin;

  // render all tiles on the board
  const tileList = tiles.map(({ id, ...rest }) => {
    return <Tile key={id} zIndex={id} {...rest} />;
  });

  return (
    <Container className="board" style={{ width: boardWidth }}>
      <BoardProvider
        containerWidth={containerWidth}
        tileCount={tileCountPerRow}
      >
        <TileContainer>{tileList}</TileContainer>
        <Grid />
      </BoardProvider>
    </Container>
  );
};
