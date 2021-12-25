import { SquareMap } from '../square-map';
import { Color, Piece, PieceType, Position, Square } from '../types';
import { squareLabel, labelToSquare } from '../utils';

export const BLANK_POSITION_FEN = '8/8/8/8/8/8/8/8 w - - 0 1';
export const STARTING_POSITION_FEN =
  'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

export const PERFT_5_FEN =
  'rnbq1k1r/pp1Pbppp/2p5/8/2B5/8/PPP1NnPP/RNBQK2R w KQ - 1 8';
export const VIENNA_GAMBIT_ACCEPTED_FEN =
  '2kr1bnr/ppp2ppp/2n5/1B2P3/5Bb1/2N2N2/PPP3PP/R2K3R/ w  - 1 11';

const FEN_PIECE_TO_PIECE_TYPE = Object.freeze({
  b: PieceType.Bishop,
  B: PieceType.Bishop,
  k: PieceType.King,
  K: PieceType.King,
  n: PieceType.Knight,
  N: PieceType.Knight,
  p: PieceType.Pawn,
  P: PieceType.Pawn,
  q: PieceType.Queen,
  Q: PieceType.Queen,
  r: PieceType.Rook,
  R: PieceType.Rook,
});

const PIECE_TYPE_TO_FEN_PIECE = Object.freeze({
  [PieceType.Bishop]: 'b',
  [PieceType.King]: 'k',
  [PieceType.Knight]: 'n',
  [PieceType.Pawn]: 'p',
  [PieceType.Queen]: 'q',
  [PieceType.Rook]: 'R',
});

const pieceToFenPiece = (piece: Piece): string =>
  piece.color === Color.White
    ? PIECE_TYPE_TO_FEN_PIECE[piece.type].toUpperCase()
    : PIECE_TYPE_TO_FEN_PIECE[piece.type].toLowerCase();

const fenPieceToColor = (pieceCharacter: string): Color =>
  'PNBRQK'.includes(pieceCharacter) ? Color.White : Color.Black;

const pieceMapFromFenPieces = (fenPieces: string): SquareMap<Piece> => {
  const pieces = new SquareMap<Piece>();

  let rank = 7;
  let file = 0;

  for (const char of fenPieces) {
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
      case 'b':
      case 'B':
      case 'k':
      case 'K':
      case 'n':
      case 'N':
      case 'p':
      case 'P':
      case 'q':
      case 'Q':
      case 'r':
      case 'R':
        pieces.set(
          { rank, file },
          {
            color: fenPieceToColor(char),
            type: FEN_PIECE_TO_PIECE_TYPE[char],
          }
        );
        // Advance the file after placing a piece.
        file += 1;
    }
  }

  return pieces;
};

const piecesToFenPieces = (pieces: Map<Square, Piece>): string => {
  let str = '';

  let emptyCounter;

  for (let rank = 7; rank >= 0; rank--) {
    emptyCounter = 0;
    for (let file = 0; file < 8; file++) {
      const piece = pieces.get({ rank, file });
      if (piece) {
        if (emptyCounter > 0) {
          str += String(emptyCounter);
        }
        str += pieceToFenPiece(piece);
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

export const parseFEN = (fenString: string): Position => {
  const [
    piecePlacements,
    activeColor,
    castlingAvailability,
    enPassantSquare,
    halfMoveClock,
    fullMoveNumber,
  ] = fenString.split(' ');

  return Object.freeze({
    pieces: pieceMapFromFenPieces(piecePlacements),
    turn: activeColor === 'w' ? Color.White : Color.Black,
    castlingAvailability: Object.freeze({
      [Color.White]: {
        kingside: castlingAvailability.includes('K'),
        queenside: castlingAvailability.includes('Q'),
      },
      [Color.Black]: {
        kingside: castlingAvailability.includes('k'),
        queenside: castlingAvailability.includes('q'),
      },
    }),
    enPassantSquare:
      enPassantSquare !== '-' ? labelToSquare(enPassantSquare) : null,
    halfMoveCount: Number(halfMoveClock),
    fullMoveCount: Number(fullMoveNumber),
  });
};

export const formatPosition = (fen: Position): string => {
  return [
    piecesToFenPieces(fen.pieces),
    fen.turn === Color.White ? 'w' : 'b',
    [
      fen.castlingAvailability[Color.White].kingside ? 'K' : '',
      fen.castlingAvailability[Color.White].queenside ? 'Q' : '',
      fen.castlingAvailability[Color.Black].kingside ? 'k' : '',
      fen.castlingAvailability[Color.Black].queenside ? 'Q' : '',
    ].join(''),
    fen.enPassantSquare ? squareLabel(fen.enPassantSquare) : '-',
    fen.halfMoveCount,
    fen.fullMoveCount,
  ].join(' ');
};
