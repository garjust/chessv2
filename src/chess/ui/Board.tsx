import React, { DragEvent, useState } from 'react';
import { State, clickSquareAction } from './workflow';
import { Color, Square } from '../types';
import { rankFileToSquare, squareGenerator } from '../utils';
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
});

const Board = ({
  squareSize,
  style,
}: {
  squareSize: number;
  style?: React.CSSProperties;
}) => {
  const { rendering, emit } = useWorkflow(render);
  const { boardOrientation } = rendering;

  const onDragStart = useObservable<[Square, DragEvent, HTMLImageElement?]>();
  useSubscription(onDragStart.obs$, async ([square, event, img]) => {
    event.dataTransfer.setData('test/plain', `${square}`);
    event.dataTransfer.dropEffect = 'move';
    if (img !== undefined) {
      event.dataTransfer.setDragImage(img, img.width / 2, img.height / 2);
    }
    emit(clickSquareAction(square));
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
        key={rankFileToSquare(square)}
        square={rankFileToSquare(square)}
        color={(square.rank + square.file) % 2 == 0 ? Color.Black : Color.White}
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
