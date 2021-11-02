import { useCallback, useEffect, useReducer, useRef } from 'react';
import { animationDuration, TileData } from 'Game2048/components/Game/Tile';
import { useIds } from '../useIds';
import { GameReducer, initialState } from './reducer';
import { tileCountInRow } from '../../Board';
export const useGame = () => {
  const isInitialRender = useRef(true);
  const [nextId] = useIds();

  // state
  const [state, dispatch] = useReducer(GameReducer, initialState);
  const { tiles, byIds, hasChanged, inMotion } = state;

  const createTile = useCallback(
    ({ coordinate, value }: Partial<TileData>) => {
      const tile = {
        id: nextId(),
        coordinate,
        value,
      } as TileData;
      dispatch({ type: 'CREATE_TILE', tile });
    },
    [nextId]
  );

  const mergeTile = (source: TileData, destination: TileData) => {
    dispatch({ type: 'MERGE_TILE', source, destination });
  };

  const throttleMergeTile = (source: TileData, destination: TileData) => {
    setTimeout(() => mergeTile(source, destination), animationDuration);
  };

  const updateTile = (tile: TileData) => {
    dispatch({ type: 'UPDATE_TILE', tile });
  };

  const didTileMove = (source: TileData, destination: TileData) => {
    const hasXChanged = source.coordinate[0] !== destination.coordinate[0];
    const hasYChanged = source.coordinate[1] !== destination.coordinate[1];
    return hasXChanged || hasYChanged;
  };

  const retrieveTileMap = useCallback(() => {
    const tileMap = new Array(16).fill(0) as number[];

    byIds.forEach((id) => {
      const { coordinate } = tiles[id];
      const index = coordinateToIndex(coordinate);
      tileMap[index] = id;
    });

    return tileMap;
  }, [byIds, tiles]);

  const findEmptyCells = useCallback(() => {
    const tileMap = retrieveTileMap();

    const emptyTiles = tileMap.reduce((result, tileId, index) => {
      if (tileId === 0) {
        return [...result, indexToCoordinate(index) as [number, number]];
      }
      return result;
    }, [] as [number, number][]);
    return emptyTiles;
  }, [retrieveTileMap]);

  const generateRandomTile = useCallback(() => {
    const emptyCells = findEmptyCells();

    if (emptyCells.length > 0) {
      const index = Math.floor(Math.random() * emptyCells.length);
      const coordinate = emptyCells[index];
      // 10percent change of generating 4 as new tile instead of 2
      let random = Math.random();
      let randomValue: number;
      if (random < 0.1) {
        randomValue = 4;
      } else {
        randomValue = 2;
      }
      createTile({ coordinate, value: randomValue });
    }
  }, [createTile, findEmptyCells]);

  // convert coordinate: [number,number] to index: number
  const coordinateToIndex = (coordinate: [number, number]) => {
    return coordinate[1] * tileCountInRow + coordinate[0];
  };
  // convert index: number to position: [number,number] on grid
  const indexToCoordinate = (index: number) => {
    const x = index % tileCountInRow;
    const y = Math.floor(index / tileCountInRow);
    return [x, y];
  };

  type RetrieveTileIdsPerRow = (rowIndex: number) => number[];
  type CalculateTileIndex = (
    tileIndex: number,
    tileInRowIndex: number,
    numberOfMerges: number,
    maxIndexInRow: number
  ) => number;

  const move = (
    retrieveTileIdsPerRow: RetrieveTileIdsPerRow,
    calculateFirstFreeIndex: CalculateTileIndex
  ) => {
    dispatch({ type: 'START_MOVE' });

    const maxIndex = tileCountInRow - 1;

    for (let rowIndex = 0; rowIndex < tileCountInRow; rowIndex++) {
      const availableTileIds = retrieveTileIdsPerRow(rowIndex);

      let previousTile: TileData | undefined;
      let mergedTilesCount = 0;

      availableTileIds.forEach((tileId, nonEmptyTileIndex) => {
        const currentTile = tiles[tileId];

        if (
          previousTile !== undefined &&
          previousTile.value === currentTile.value
        ) {
          const tile = {
            ...currentTile,
            coordinate: previousTile.coordinate,
            mergeWith: previousTile.id,
          } as TileData;

          throttleMergeTile(tile, previousTile);
          previousTile = undefined;
          mergedTilesCount++;
          return updateTile(tile);
        }

        const tile = {
          ...currentTile,
          coordinate: indexToCoordinate(
            calculateFirstFreeIndex(
              rowIndex,
              nonEmptyTileIndex,
              mergedTilesCount,
              maxIndex
            )
          ),
        } as TileData;

        previousTile = tile;

        if (didTileMove(currentTile, tile)) {
          return updateTile(tile);
        }
      });
    }

    setTimeout(() => dispatch({ type: 'END_MOVE' }), animationDuration);
  };

  const moveLeftFactory = () => {
    const retrieveTileIdsByRow = (rowIndex: number) => {
      const tileMap = retrieveTileMap();

      const tileIdsInRow = [
        tileMap[rowIndex * tileCountInRow + 0],
        tileMap[rowIndex * tileCountInRow + 1],
        tileMap[rowIndex * tileCountInRow + 2],
        tileMap[rowIndex * tileCountInRow + 3],
      ];

      const nonEmptyTiles = tileIdsInRow.filter((id) => id !== 0);
      return nonEmptyTiles;
    };

    const calculateFirstFreeIndex = (
      tileIndex: number,
      tileInRowIndex: number,
      numberOfMerges: number,
      _: number
    ) => {
      return tileIndex * tileCountInRow + tileInRowIndex - numberOfMerges;
    };

    return move.bind(this, retrieveTileIdsByRow, calculateFirstFreeIndex);
  };

  const moveRightFactory = () => {
    const retrieveTileIdsByRow = (rowIndex: number) => {
      const tileMap = retrieveTileMap();

      const tileIdsInRow = [
        tileMap[rowIndex * tileCountInRow + 0],
        tileMap[rowIndex * tileCountInRow + 1],
        tileMap[rowIndex * tileCountInRow + 2],
        tileMap[rowIndex * tileCountInRow + 3],
      ];

      const nonEmptyTiles = tileIdsInRow.filter((id) => id !== 0);
      return nonEmptyTiles.reverse();
    };

    const calculateFirstFreeIndex = (
      tileIndex: number,
      tileInRowIndex: number,
      numberOfMerges: number,
      maxIndexInRow: number
    ) => {
      return (
        tileIndex * tileCountInRow +
        maxIndexInRow +
        numberOfMerges -
        tileInRowIndex
      );
    };

    return move.bind(this, retrieveTileIdsByRow, calculateFirstFreeIndex);
  };

  const moveUpFactory = () => {
    const retrieveTileIdsByColumn = (columnIndex: number) => {
      const tileMap = retrieveTileMap();

      const tileIdsInColumn = [
        tileMap[columnIndex + tileCountInRow * 0],
        tileMap[columnIndex + tileCountInRow * 1],
        tileMap[columnIndex + tileCountInRow * 2],
        tileMap[columnIndex + tileCountInRow * 3],
      ];

      const nonEmptyTiles = tileIdsInColumn.filter((id) => id !== 0);
      return nonEmptyTiles;
    };

    const calculateFirstFreeIndex = (
      tileIndex: number,
      tileInColumnIndex: number,
      numberOfMerges: number,
      _: number
    ) => {
      return tileIndex + tileCountInRow * (tileInColumnIndex - numberOfMerges);
    };

    return move.bind(this, retrieveTileIdsByColumn, calculateFirstFreeIndex);
  };

  const moveDownFactory = () => {
    const retrieveTileIdsByColumn = (columnIndex: number) => {
      const tileMap = retrieveTileMap();

      const tileIdsInColumn = [
        tileMap[columnIndex + tileCountInRow * 0],
        tileMap[columnIndex + tileCountInRow * 1],
        tileMap[columnIndex + tileCountInRow * 2],
        tileMap[columnIndex + tileCountInRow * 3],
      ];

      const nonEmptyTiles = tileIdsInColumn.filter((id) => id !== 0);
      return nonEmptyTiles.reverse();
    };

    const calculateFirstFreeIndex = (
      tileIndex: number,
      tileInColumnIndex: number,
      howManyMerges: number,
      maxIndexInColumn: number
    ) => {
      return (
        tileIndex +
        tileCountInRow * (maxIndexInColumn - tileInColumnIndex + howManyMerges)
      );
    };

    return move.bind(this, retrieveTileIdsByColumn, calculateFirstFreeIndex);
  };

  useEffect(() => {
    if (isInitialRender.current) {
      createTile({ coordinate: [0, 1], value: 2 });
      createTile({ coordinate: [0, 2], value: 2 });
      isInitialRender.current = false;
      return;
    }
    if (!inMotion && hasChanged) {
      generateRandomTile();
    }
  }, [createTile, generateRandomTile, hasChanged, inMotion]);

  const tileList = byIds.map((tileId) => tiles[tileId]);

  const moveLeft = moveLeftFactory();
  const moveRight = moveRightFactory();
  const moveUp = moveUpFactory();
  const moveDown = moveDownFactory();

  return [tileList, moveLeft, moveRight, moveUp, moveDown] as [
    TileData[],
    () => void,
    () => void,
    () => void,
    () => void
  ];
};
