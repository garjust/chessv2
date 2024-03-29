import React, { DragEvent } from 'react';
import { State, clickSquareAction } from './workflow';
import { Color, Square } from '../types';
import {
  fileIndexForSquare,
  rankIndexForSquare,
  squareGenerator,
} from '../utils';
import './Board.css';
import BoardSquare from './BoardSquare';
import { useWorkflow } from './workflow-context';
import { BOARD_BORDER } from './theme';
import {
  useObservable,
  useSubscription,
} from '../../rx-workflow/react/observable';

const render = (state: State) => ({
  boardOrientation: state.boardOrientation,
  selectedSquare: state.selectedSquare,
});

const Board = ({
  squareSize,
  style,
}: {
  squareSize: number;
  style?: React.CSSProperties;
}) => {
  const { rendering, emit } = useWorkflow(render);
  const { boardOrientation, selectedSquare } = rendering;

  const onDragStart = useObservable<[Square, DragEvent, HTMLImageElement?]>();
  useSubscription(onDragStart.obs$, async ([square, event, img]) => {
    event.dataTransfer.setData('test/plain', `${square}`);
    event.dataTransfer.dropEffect = 'move';
    if (img !== undefined) {
      event.dataTransfer.setDragImage(img, img.width / 2, img.height / 2);
    }

    // If the square is already selected, don't fire a click event. This way
    // we can just "swap" into drag mode with the same piece.
    if (selectedSquare !== square) {
      emit(clickSquareAction(square));
    }
  });

  const onDragOver = useObservable<DragEvent>();
  useSubscription(onDragOver.obs$, (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  });

  const onDrop = useObservable<[Square, DragEvent]>();
  useSubscription(onDrop.obs$, ([square, event]) => {
    event.preventDefault();
    emit(clickSquareAction(square));
  });

  const squares: JSX.Element[] = [];
  for (const square of squareGenerator()) {
    squares.push(
      <BoardSquare
        key={square}
        square={square}
        color={
          (rankIndexForSquare(square) + fileIndexForSquare(square)) % 2 == 0
            ? Color.Black
            : Color.White
        }
        size={squareSize}
        onDragStart={onDragStart.next}
        onDragOver={onDragOver.next}
        onDrop={onDrop.next}
      />,
    );
  }

  return (
    <div
      className={
        boardOrientation === Color.White ? 'board' : 'board board--flipped'
      }
      style={{
        ...style,
        height: squareSize * 8,
        width: squareSize * 8,
        backgroundColor: BOARD_BORDER,
      }}
    >
      {squares}
    </div>
  );
};

export default Board;
