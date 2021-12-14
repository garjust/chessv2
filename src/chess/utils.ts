import {
  Color,
  FEN,
  Piece,
  PieceAndSquare,
  PieceType,
  Square,
  SquareDef,
} from './types';

export const STARTING_POSITION_FEN =
  'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

export const fileIndexToChar = (index: number): string =>
  String.fromCharCode(index + 97);

export const squareLabel = ({ rank, file }: SquareDef): string =>
  `${fileIndexToChar(file)}${rank + 1}`;

export const squareLabelToDef = (label: string): SquareDef => ({
  rank: label.charCodeAt(0) - 97,
  file: Number(label[1]) - 1,
});

export const squareGenerator = function* () {
  for (let rank = 0; rank < 8; rank++) {
    for (let file = 0; file < 8; file++) {
      yield { rank, file };
    }
  }
};

export const squareInBoard = (
  board: Square[][],
  squareDef: SquareDef
): Square => board[squareDef.rank][squareDef.file];

export const buildBoard = (): Square[][] => {
  const board = new Array<Square[]>(8);
  for (let i = 0; i < 8; i++) {
    board[i] = new Array<Square>(8);
  }

  for (const { rank, file } of squareGenerator()) {
    board[rank][file] = {
      rank,
      file,
      piece: null,
    };
  }

  return board;
};

export const setPosition = (board: Square[][], pieces: PieceAndSquare[]) =>
  pieces.forEach(({ piece, squareDef }) => {
    board[squareDef.rank][squareDef.file].piece = {
      color: piece.color,
      type: piece.type,
    };
  });

export const setPositionFromFEN = (board: Square[][], fenString: string) => {
  setPosition(board, parseFEN(fenString).pieces);
};

const fenNotationPieceToType = (pieceCharacter: string): PieceType => {
  switch (pieceCharacter) {
    case 'b':
    case 'B':
      return PieceType.Bishop;
    case 'k':
    case 'K':
      return PieceType.King;
    case 'n':
    case 'N':
      return PieceType.Knight;
    case 'p':
    case 'P':
      return PieceType.Pawn;
    case 'q':
    case 'Q':
      return PieceType.Queen;
    case 'r':
    case 'R':
      return PieceType.Rook;
    default:
      throw Error(`no piece for FEN character ${pieceCharacter}`);
  }
};

const pieceToFenNotationCharacter = (piece: Piece): string => {
  let letter: string;
  switch (piece.type) {
    case PieceType.Bishop:
      letter = 'b';
      break;
    case PieceType.King:
      letter = 'k';
      break;
    case PieceType.Knight:
      letter = 'n';
      break;
    case PieceType.Pawn:
      letter = 'p';
      break;
    case PieceType.Queen:
      letter = 'q';
      break;
    case PieceType.Rook:
      letter = 'R';
      break;
  }

  if (piece.color === Color.White) {
    return letter.toUpperCase();
  } else {
    return letter.toLowerCase();
  }
};

const fenNotationPieceToColor = (pieceCharacter: string): Color =>
  'PNBRQK'.includes(pieceCharacter) ? Color.White : Color.Black;

const piecePlacementsFromFEN = (piecePlacements: string): PieceAndSquare[] => {
  const pieces: PieceAndSquare[] = [];

  let rank = 7;
  let file = 0;

  for (const char of piecePlacements) {
    switch (char) {
      case '1':
      case '2':
      case '3':
      case '4':
      case '5':
      case '6':
      case '7':
      case '8':
        // Advance the file.
        file += Number(char);
        break;
      case '/':
        // Advance the rank.
        rank -= 1;
        file = 0;
        break;
      default:
        pieces.push({
          piece: {
            color: fenNotationPieceToColor(char),
            type: fenNotationPieceToType(char),
          },
          squareDef: { rank, file },
        });
        // Advance the file after placing a piece.
        file += 1;
    }
  }

  return pieces;
};

export const parseFEN = (fenString: string): FEN => {
  const [
    piecePlacements,
    activeColor,
    castlingAvailability,
    enPassantSquare,
    halfMoveClock,
    fullMoveNumber,
  ] = fenString.split(' ');

  return {
    pieces: piecePlacementsFromFEN(piecePlacements),
    turn: activeColor === 'w' ? Color.White : Color.Black,
    castlingAvailability: {
      whiteKingside: castlingAvailability.includes('K'),
      whiteQueenside: castlingAvailability.includes('Q'),
      blackKingside: castlingAvailability.includes('k'),
      blackQueenside: castlingAvailability.includes('q'),
    },
    enPassantSquare:
      enPassantSquare !== '-' ? squareLabelToDef(enPassantSquare) : null,
    halfMoveCount: Number(halfMoveClock),
    fullMoveCount: Number(fullMoveNumber),
  };
};

const formatFENPieces = (pieces: PieceAndSquare[]): string => {
  let str = '';

  const board = buildBoard();
  setPosition(board, pieces);

  let emptyCounter;

  for (let rank = 7; rank >= 0; rank--) {
    emptyCounter = 0;
    for (let file = 0; file < 8; file++) {
      const piece = board[rank][file].piece;
      if (piece) {
        if (emptyCounter > 0) {
          str += String(emptyCounter);
        }
        str += pieceToFenNotationCharacter(piece);
        emptyCounter = 0;
      } else {
        emptyCounter++;
      }
    }
    if (emptyCounter > 0) {
      str += String(emptyCounter);
    }
    str += '/';
  }

  return str;
};

export const formatFEN = (fen: FEN): string => {
  return [
    formatFENPieces(fen.pieces),
    fen.turn === Color.White ? 'w' : 'b',
    [
      fen.castlingAvailability.whiteKingside ? 'K' : '',
      fen.castlingAvailability.whiteQueenside ? 'Q' : '',
      fen.castlingAvailability.blackKingside ? 'k' : '',
      fen.castlingAvailability.blackQueenside ? 'Q' : '',
    ].join(''),
    fen.enPassantSquare ? squareLabel(fen.enPassantSquare) : '-',
    fen.halfMoveCount,
    fen.fullMoveCount,
  ].join(' ');
};

export const findPiecesInboard = (board: Square[][]): PieceAndSquare[] =>
  board
    .flat()
    .map((square) => ({
      piece: square.piece,
      squareDef: { rank: square.rank, file: square.file },
    }))
    .filter(
      (pieceAndSquare): pieceAndSquare is PieceAndSquare =>
        pieceAndSquare.piece !== null
    );
