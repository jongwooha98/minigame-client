import { pixelSize } from '../../styles';
import styled from '@emotion/styled';
import { useBoard } from '../Board';

const Container = styled.div`
  display: flex;
  flex-wrap: wrap;
  background-color: #000;
  border: ${pixelSize}px solid #000;
  border-radius: ${pixelSize * 0.75}px;
`;

const SingleCell = styled.div`
  width: ${pixelSize * 12.5}px;
  height: ${pixelSize * 12.5}px;
  margin: ${pixelSize * 1}px;
  border-radius: ${pixelSize * 0.5}px;
  background: hotpink;
`;

export const Grid = () => {
  const [, tileCount] = useBoard();
  const renderGrid = () => {
    const length = tileCount * tileCount;
    const cells = [] as JSX.Element[];

    for (let i = 0; i < length; i++) {
      cells.push(<SingleCell key={`${i}`} className={`grid-cell`} />);
    }
    return cells;
  };
  return <Container className="grid">{renderGrid()}</Container>;
};
