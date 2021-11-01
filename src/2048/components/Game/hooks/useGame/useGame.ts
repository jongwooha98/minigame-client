import { useCallback, useEffect, useReducer, useRef } from 'react';
import {
  animationDuration,
  tileCount as tileCountPerRow,
} from '../../../Board';
import { TileMeta } from '../../../Tile';
import { useIds } from '../useIds';
import { GameReducer, initialState } from './reducer';

export const useGame = () => {
  const isInitialRender = useRef(true);
  const [nextId] = useIds();

  // state
  const [state, dispatch] = useReducer(GameReducer, initialState);
  const { tiles, byIds, hasChanged, inMotion } = state;

  const createTile = useCallback(
    ({ position, value }: Partial<TileMeta>) => {
      const tile = {
        id: nextId(),
        position,
        value,
      } as TileMeta;
      dispatch({ type: 'CREATE_TILE', tile });
    },
    [nextId]
  );

  const mergeTile = (source: TileMeta, destination: TileMeta) => {
    dispatch({ type: 'MERGE_TILE', source, destination });
  };

  const throttleMergeTile = (source: TileMeta, destination: TileMeta) => {
    setTimeout(() => mergeTile(source, destination), animationDuration);
  };

  const updateTile = (tile: TileMeta) => {
    dispatch({ type: 'UPDATE_TILE', tile });
  };

  const didTileMove = (source: TileMeta, destination: TileMeta) => {
    const hasXChanged = source.position[0] !== destination.position[0];
    const hasYChanged = source.position[1] !== destination.position[1];
    return hasXChanged || hasYChanged;
  };

  const retrieveTileMap = useCallback(() => {
    const tileMap = new Array(tileCountPerRow * tileCountPerRow).fill(
      0
    ) as number[];

    byIds.forEach((id) => {
      const { position } = tiles[id];
      const index = positionToIndex(position);
      tileMap[index] = id;
    });

    return tileMap;
  }, [byIds, tiles]);

  const findEmptyTiles = useCallback(() => {
    const tileMap = retrieveTileMap();

    const emptyTiles = tileMap.reduce((result, tileId, index) => {
      if (tileId === 0) {
        return [...result, indexToPosition(index) as [number, number]];
      }
      return result;
    }, [] as [number, number][]);
    return emptyTiles;
  }, [retrieveTileMap]);

  const generateRandomTile = useCallback(() => {
    const emptyTiles = findEmptyTiles();

    if (emptyTiles.length > 0) {
      const index = Math.floor(Math.random() * emptyTiles.length);
      const position = emptyTiles[index];
      // 10percent change of generating 4 as new tile instead of 2
      let random = Math.random();
      let randomValue: number;
      if (random < 0.1) {
        randomValue = 4;
      } else {
        randomValue = 2;
      }
      createTile({ position, value: randomValue });
    }
  }, [createTile, findEmptyTiles]);

  // convert position: [number,number] to index: number
  const positionToIndex = (position: [number, number]) => {
    return position[1] * tileCountPerRow + position[0];
  };
  // convert index: number to position: [number,number] on grid
  const indexToPosition = (index: number) => {
    const x = index % tileCountPerRow;
    const y = Math.floor(index / tileCountPerRow);
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

    const maxIndex = tileCountPerRow - 1;

    for (let rowIndex = 0; rowIndex < tileCountPerRow; rowIndex++) {
      const availableTileIds = retrieveTileIdsPerRow(rowIndex);

      let previousTile: TileMeta | undefined;
      let mergedTilesCount = 0;

      availableTileIds.forEach((tileId, nonEmptyTileIndex) => {
        const currentTile = tiles[tileId];

        if (
          previousTile !== undefined &&
          previousTile.value === currentTile.value
        ) {
          const tile = {
            ...currentTile,
            position: previousTile.position,
            mergeWith: previousTile.id,
          } as TileMeta;

          throttleMergeTile(tile, previousTile);
          previousTile = undefined;
          mergedTilesCount++;
          return updateTile(tile);
        }

        const tile = {
          ...currentTile,
          position: indexToPosition(
            calculateFirstFreeIndex(
              rowIndex,
              nonEmptyTileIndex,
              mergedTilesCount,
              maxIndex
            )
          ),
        } as TileMeta;

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
        tileMap[rowIndex * tileCountPerRow + 0],
        tileMap[rowIndex * tileCountPerRow + 1],
        tileMap[rowIndex * tileCountPerRow + 2],
        tileMap[rowIndex * tileCountPerRow + 3],
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
      return tileIndex * tileCountPerRow + tileInRowIndex - numberOfMerges;
    };

    return move.bind(this, retrieveTileIdsByRow, calculateFirstFreeIndex);
  };

  const moveRightFactory = () => {
    const retrieveTileIdsByRow = (rowIndex: number) => {
      const tileMap = retrieveTileMap();

      const tileIdsInRow = [
        tileMap[rowIndex * tileCountPerRow + 0],
        tileMap[rowIndex * tileCountPerRow + 1],
        tileMap[rowIndex * tileCountPerRow + 2],
        tileMap[rowIndex * tileCountPerRow + 3],
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
        tileIndex * tileCountPerRow +
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
        tileMap[columnIndex + tileCountPerRow * 0],
        tileMap[columnIndex + tileCountPerRow * 1],
        tileMap[columnIndex + tileCountPerRow * 2],
        tileMap[columnIndex + tileCountPerRow * 3],
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
      return tileIndex + tileCountPerRow * (tileInColumnIndex - numberOfMerges);
    };

    return move.bind(this, retrieveTileIdsByColumn, calculateFirstFreeIndex);
  };

  const moveDownFactory = () => {
    const retrieveTileIdsByColumn = (columnIndex: number) => {
      const tileMap = retrieveTileMap();

      const tileIdsInColumn = [
        tileMap[columnIndex + tileCountPerRow * 0],
        tileMap[columnIndex + tileCountPerRow * 1],
        tileMap[columnIndex + tileCountPerRow * 2],
        tileMap[columnIndex + tileCountPerRow * 3],
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
        tileCountPerRow * (maxIndexInColumn - tileInColumnIndex + howManyMerges)
      );
    };

    return move.bind(this, retrieveTileIdsByColumn, calculateFirstFreeIndex);
  };

  useEffect(() => {
    if (isInitialRender.current) {
      createTile({ position: [0, 1], value: 2 });
      createTile({ position: [0, 2], value: 2 });
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
    TileMeta[],
    () => void,
    () => void,
    () => void,
    () => void
  ];
};
