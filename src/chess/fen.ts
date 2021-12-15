import { Color, Piece, PieceType, Position, Square } from './types';
import { squareLabel, labelToSquare, SquareMap } from './utils';

export const BLANK_POSITION_FEN = '8/8/8/8/8/8/8/8 w - - 0 1';
export const STARTING_POSITION_FEN =
  'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

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

const piecePlacementsFromFEN = (piecePlacements: string): SquareMap<Piece> => {
  const pieces = new SquareMap<Piece>();

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
        pieces.set(
          { rank, file },
          {
            color: fenNotationPieceToColor(char),
            type: fenNotationPieceToType(char),
          }
        );
        // Advance the file after placing a piece.
        file += 1;
    }
  }

  return pieces;
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
    pieces: piecePlacementsFromFEN(piecePlacements),
    turn: activeColor === 'w' ? Color.White : Color.Black,
    castlingAvailability: Object.freeze({
      whiteKingside: castlingAvailability.includes('K'),
      whiteQueenside: castlingAvailability.includes('Q'),
      blackKingside: castlingAvailability.includes('k'),
      blackQueenside: castlingAvailability.includes('q'),
    }),
    enPassantSquare:
      enPassantSquare !== '-' ? labelToSquare(enPassantSquare) : null,
    halfMoveCount: Number(halfMoveClock),
    fullMoveCount: Number(fullMoveNumber),
  });
};

const formatFENPieces = (pieces: SquareMap<Piece>): string => {
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

export const formatPosition = (fen: Position): string => {
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
