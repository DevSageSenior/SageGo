const Pieces = require('./Pieces');

module.exports.setupBoardClassic = (i) => {
  let piece = '';
  switch (i) {
    case 0:
      piece = new Pieces.Rook('white', 'white-rook');
      break;
    case 1:
      piece = new Pieces.Knight('white', 'white-knight');
      break;
    case 2:
      piece = new Pieces.Bishop('white', 'white-bishop');
      break;
    case 3:
      piece = new Pieces.Queen('white', 'white-queen');
      break;
    case 4:
      piece = new Pieces.King('white', 'white-king');
      break;
    case 5:
      piece = new Pieces.Bishop('white', 'white-bishop');
      break;
    case 6:
      piece = new Pieces.Knight('white', 'white-knight');
      break;
    case 7:
      piece = new Pieces.Rook('white', 'white-rook');
      break;
    case 8:
      piece = new Pieces.Pawn('white', 'white-pawn');
      break;
    case 9:
      piece = new Pieces.Pawn('white', 'white-pawn');
      break;
    case 10:
      piece = new Pieces.Pawn('white', 'white-pawn');
      break;
    case 11:
      piece = new Pieces.Pawn('white', 'white-pawn');
      break;
    case 12:
      piece = new Pieces.Pawn('white', 'white-pawn');
      break;
    case 13:
      piece = new Pieces.Pawn('white', 'white-pawn');
      break;
    case 14:
      piece = new Pieces.Pawn('white', 'white-pawn');
      break;
    case 15:
      piece = new Pieces.Pawn('white', 'white-pawn');
      break;
    case 48:
      piece = new Pieces.Pawn('black', 'black-pawn');
      break;
    case 49:
      piece = new Pieces.Pawn('black', 'black-pawn');
      break;
    case 50:
      piece = new Pieces.Pawn('black', 'black-pawn');
      break;
    case 51:
      piece = new Pieces.Pawn('black', 'black-pawn');
      break;
    case 52:
      piece = new Pieces.Pawn('black', 'black-pawn');
      break;
    case 53:
      piece = new Pieces.Pawn('black', 'black-pawn');
      break;
    case 54:
      piece = new Pieces.Pawn('black', 'black-pawn');
      break;
    case 55:
      piece = new Pieces.Pawn('black', 'black-pawn');
      break;
    case 56:
      piece = new Pieces.Rook('black', 'black-rook');
      break;
    case 57:
      piece = new Pieces.Knight('black', 'black-knight');
      break;
    case 58:
      piece = new Pieces.Bishop('black', 'black-bishop');
      break;
    case 59:
      piece = new Pieces.Queen('black', 'black-queen');
      break;
    case 60:
      piece = new Pieces.King('black', 'black-king');
      break;
    case 61:
      piece = new Pieces.Bishop('black', 'black-bishop');
      break;
    case 62:
      piece = new Pieces.Knight('black', 'black-knight');
      break;
    case 63:
      piece = new Pieces.Rook('black', 'black-rook');
      break;
    default:
      piece = new Pieces.Empty('', 'empty-square');
      break;
  }
  return piece;
};

module.exports.indexToTileNotation = {
  0: 'A1',
  1: 'B1',
  2: 'C1',
  3: 'D1',
  4: 'E1',
  5: 'F1',
  6: 'G1',
  7: 'H1',

  8: 'A2',
  9: 'B2',
  10: 'C2',
  11: 'D2',
  12: 'E2',
  13: 'F2',
  14: 'G2',
  15: 'H2',

  16: 'A3',
  17: 'B3',
  18: 'C3',
  19: 'D3',
  20: 'E3',
  21: 'F3',
  22: 'G3',
  23: 'H3',

  24: 'A4',
  25: 'B4',
  26: 'C4',
  27: 'D4',
  28: 'E4',
  29: 'F4',
  30: 'G4',
  31: 'H4',

  32: 'A5',
  33: 'B5',
  34: 'C5',
  35: 'D5',
  36: 'E5',
  37: 'F5',
  38: 'G5',
  39: 'H5',

  40: 'A6',
  41: 'B6',
  42: 'C6',
  43: 'D6',
  44: 'E6',
  45: 'F6',
  46: 'G6',
  47: 'H6',

  48: 'A7',
  49: 'B7',
  50: 'C7',
  51: 'D7',
  52: 'E7',
  53: 'F7',
  54: 'G7',
  55: 'H7',

  56: 'A8',
  57: 'B8',
  58: 'C8',
  59: 'D8',
  60: 'E8',
  61: 'F8',
  62: 'G8',
  63: 'H8',
};

module.exports.getRowColumnFromIndex = (index) => {
  let notation = indexToTileNotation[index];
  let col = -1;
  switch (notation[0]) {
    case 'A': {
      col = 0;
      break;
    }
    case 'B': {
      col = 1;
      break;
    }
    case 'C': {
      col = 2;
      break;
    }
    case 'D': {
      col = 3;
      break;
    }
    case 'E': {
      col = 4;
      break;
    }
    case 'F': {
      col = 5;
      break;
    }
    case 'G': {
      col = 6;
      break;
    }
    case 'H': {
      col = 7;
      break;
    }
  }

  let row = -1;
  switch (notation[1]) {
    case '1': {
      row = 0;
      break;
    }
    case '2': {
      row = 1;
      break;
    }
    case '3': {
      row = 2;
      break;
    }
    case '4': {
      row = 3;
      break;
    }
    case '5': {
      row = 4;
      break;
    }
    case '6': {
      row = 5;
      break;
    }
    case '7': {
      row = 6;
      break;
    }
    case '8': {
      row = 7;
      break;
    }
  }

  return [row, col];
};
