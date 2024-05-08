const { setupBoardClassic } = require('./Helper');
const { Empty, Death, Fear, Queen, Bishop, Rook, Knight } = require('./Pieces');

const matchedColour = ['white', 'black'];

class ChessBoard {
  size = 64;

  constructor(deaths = [], fears = []) {
    this.board = new Array(this.size);
    for (let i = 0; i < this.size; i++) {
      this.board[i] = setupBoardClassic(i);
    }
    deaths.forEach((death) => {
      this.board[death] = new Death('', 'death-square');
    });
    fears.forEach((fear) => {
      this.board[fear] = new Fear('', 'fear-square');
    });
    // 0 refers to white turn
    this.turn = 0;
    this.lastMove = {
      type: 'Empty',
      from: -1,
      to: -1,
      kill: false,
    };
  }

  clone() {
    let cloned = new ChessBoard();
    cloned.board = [...this.board];
    cloned.turn = this.turn;
    cloned.lastMove = this.lastMove;
    return cloned;
  }

  getPieceType(pos) {
    if (pos < 0 || pos >= this.size) return 'Outside';
    return this.board[pos].constructor.name;
  }

  isValidMove(from, to) {
    if (this.getPieceType(from) === 'Outside' || this.getPieceType(to) === 'Outside') {
      return 'Outside';
    }
    if (this.getPieceType(from) === 'Empty') {
      return 'Empty';
    }
    let fromPiece = this.board[from];
    if ((fromPiece.colour === 'white' && this.turn === 1) || (fromPiece.color === 'black' && this.turn === 0)) {
      return 'Not correct turn';
    }
    let optionalMoves = this.getAvailableMoves(from);
    if (optionalMoves.indexOf(to) == -1) return "It's not an available move";
    let alternativeBoard = this.clone();
    alternativeBoard.makeMove(from, to);
    if (alternativeBoard.isInCheck(fromPiece.colour)) return 'The king will be in check';
    return 'Valid';
  }

  promote(piece, promotion) {
    let colour = this.board[piece].colour;
    if (this.getPieceType(piece) != 'Pawn') return;
    switch (promotion) {
      case 'Q': {
        this.board[piece] = new Queen(colour, `${colour}-queen`);
        return;
      }
      case 'B': {
        this.board[piece] = new Bishop(colour, `${colour}-bishop`);
        return;
      }
      case 'R': {
        this.board[piece] = new Rook(colour, `${colour}-rook`);
        return;
      }
      case 'N': {
        this.board[piece] = new Knight(colour, `${colour}-knight`);
        return;
      }
    }
  }

  isFinished() {
    let colour = matchedColour[this.turn];
    if (!this.isInCheck(colour)) return false;
    for (let i = 0; i < this.size; i++) {
      if (this.board[i].colour === colour) {
        let optionalMoves = this.getAvailableMoves(i);
        for (let move of optionalMoves) {
          let alternativeBoard = this.clone();
          alternativeBoard.makeMove(i, move);
          if (!alternativeBoard.isInCheck(colour)) return false;
        }
      }
    }
    return true;
  }

  pass() {
    this.lastMove.type = 'Pass';
    this.lastMove.from = this.lastMove.to = -1;
    this.lastMove.kill = false;
    this.turn = 1 - this.turn;
  }

  makeMove(from, to) {
    let kill = false;
    if (this.getPieceType(to) === 'Empty') {
      if (this.getPieceType(from) === 'King' && Math.abs(from - to) == 2) {
        let nextRookPos = (from + to) / 2;
        let currentRookPos = from < to ? from + 3 : from - 4;
        this.board[to] = this.board[from];
        this.board[from] = new Empty('', 'empty-square');
        this.board[to].hasMoved = true;
        this.board[nextRookPos] = this.board[currentRookPos];
        this.board[nextRookPos].hasMoved = true;
        this.board[currentRookPos] = new Empty('', 'empty-square');
      } else if (
        this.getPieceType(from) === 'Pawn' &&
        this.lastMove.type === 'Pawn' &&
        this.lastMove.from + this.lastMove.to == to * 2
      ) {
        this.board[to] = this.board[from];
        this.board[to].hasMoved = true;
        this.board[from] = new Empty('', 'empty-square');
        this.board[this.lastMove.to] = new Empty('', 'empty-square');
        kill = true;
      } else {
        this.board[to] = this.board[from];
        this.board[to].hasMoved = true;
        this.board[from] = new Empty('', 'empty-square');
      }
    } else {
      this.board[to] = this.board[from];
      this.board[to].hasMoved = true;
      this.board[from] = new Empty('', 'empty-square');
      kill = true;
    }
    let opponentKing;
    for (let i = 0; i < this.size; i++)
      if (this.getPieceType(i) == 'King' && this.board[i].colour == matchedColour[1 - this.turn]) opponentKing = i;
    if (this.isInCheck(matchedColour[1 - this.turn])) {
      this.board[opponentKing].hasChecked = true;
    }
    this.lastMove = {
      type: this.getPieceType(to),
      from,
      to,
      kill,
    };
    this.turn = 1 - this.turn;
    return this;
  }

  isInDiagonal(from, to) {
    let fromX = parseInt(from / 8);
    let fromY = from % 8;
    let toX = parseInt(to / 8);
    let toY = to % 8;
    return Math.abs(fromX - toX) == Math.abs(fromY - toY);
  }
  isInSide(from, to) {
    let fromX = parseInt(from / 8);
    let fromY = from % 8;
    let toX = parseInt(to / 8);
    let toY = to % 8;
    return Math.abs(fromX - toX) == 0 || Math.abs(fromY - toY) == 0;
  }
  getX(piece) {
    return parseInt(piece / 8);
  }
  getY(piece) {
    return piece % 8;
  }
  isInKnight(from, to) {
    let fromX = parseInt(from / 8);
    let fromY = from % 8;
    let toX = parseInt(to / 8);
    let toY = to % 8;
    return Math.abs(fromX - toX) + Math.abs(fromY - toY) == 3;
  }
  isInDirection(from, to) {
    let diff = to - from;
    let isSide = [-8, -1, 1, 8].indexOf(diff) != -1;
    return (isSide && this.isInSide(from, to)) || (!isSide && this.isInDiagonal(from, to));
  }

  isReachable(to) {
    const type = this.getPieceType(to);
    return type != 'Outside' && type != 'Death' && type != 'Fear';
  }

  isInCheck(colour) {
    let king = 0;
    for (let i = 0; i < this.size; i++) {
      if (this.getPieceType(i) == 'King' && this.board[i].colour == colour) king = i;
    }
    for (let i = 0; i < this.size; i++) {
      if (this.board[i].colour != 'white' && this.board[i].colour != 'black') continue;
      let availableMoves = this.getAvailableMoves(i);
      if (availableMoves.indexOf(king) != -1) return true;
    }
    return false;
  }

  isOpponent(lv, rv) {
    let lvColour = this.board[lv].colour;
    let rvColour = this.board[rv].colour;
    if ((lvColour != 'black' && lvColour != 'white') || (rvColour != 'black' && rvColour != 'white')) return false;
    return lvColour != rvColour;
  }

  expectFrom(pieceType, to) {
    let options = [];
    for (let i = 0; i < this.size; i++) {
      if (this.getPieceType(i) == pieceType && this.board[i].colour == matchedColour[this.turn]) {
        if (this.getAvailableMoves(i).indexOf(to) != -1) options.push(i);
      }
    }
    return options;
  }

  getAvailableMoves(from) {
    const piece = this.board[from];
    const getDirectAvailableMoves = (diffs) => {
      let optionalMoves = [];
      for (let diff of diffs) {
        let nextPos = diff + from;
        while (
          (this.getPieceType(nextPos) === 'Empty' || this.getPieceType(nextPos) === 'Death') &&
          this.isInDirection(nextPos - diff, nextPos)
        ) {
          optionalMoves.push(nextPos);
          nextPos = diff + nextPos;
        }
        if (
          nextPos >= 0 &&
          nextPos < this.size &&
          this.isOpponent(nextPos, from) &&
          this.isInDirection(nextPos - diff, nextPos)
        )
          optionalMoves.push(nextPos);
      }
      return optionalMoves.filter((move) => {
        return this.getPieceType(move) !== 'Death';
      });
    };
    switch (this.getPieceType(from)) {
      case 'Pawn': {
        const sign = piece.colour === 'white' ? 1 : -1;
        let optionalMoves = [];
        let nextPos = from + 8 * sign;
        if (nextPos >= 0 && nextPos < this.size && this.getPieceType(nextPos) === 'Empty') {
          optionalMoves = [from + 8 * sign];
        }
        if (!piece.hasMoved && (optionalMoves.length || this.getPieceType(nextPos) === 'Death')) {
          let nextPos = from + 16 * sign;
          if (nextPos >= 0 && nextPos < this.size && this.getPieceType(nextPos) === 'Empty') {
            optionalMoves.push(nextPos);
          }
        }
        for (let optionalDiff of [7, 9]) {
          let nextPos = from + sign * optionalDiff;
          if (Math.abs(this.getX(nextPos) - this.getX(from)) != 1) continue;
          if (nextPos >= 0 && nextPos < this.size) {
            if (
              this.getPieceType(nextPos) != 'Empty' &&
              this.getPieceType(nextPos) != 'Death' &&
              this.getPieceType(nextPos) != 'Fear'
            ) {
              if (this.board[nextPos].colour != piece.colour) optionalMoves.push(nextPos);
            } else if (this.getPieceType(nextPos) == 'Empty') {
              if (this.lastMove.type == 'Pawn' && this.lastMove.from + this.lastMove.to == nextPos * 2)
                optionalMoves.push(nextPos);
            }
          }
        }
        return optionalMoves;
      }
      case 'Queen': {
        return getDirectAvailableMoves([-7, -8, -9, -1, 1, 7, 8, 9]);
      }
      case 'Rook': {
        return getDirectAvailableMoves([-8, -1, 1, 8]);
      }
      case 'Bishop': {
        return getDirectAvailableMoves([-7, -9, 7, 9]);
      }
      case 'King': {
        let optionalMoves = [];
        let diffs = [-7, -8, -9, -1, 1, 7, 8, 9];
        for (let diff of diffs) {
          let nextPos = from + diff;
          if (Math.max(Math.abs(this.getX(nextPos) - this.getX(from)), Math.abs(this.getY(nextPos) - this.getY(from))) != 1)
            continue;
          if (
            nextPos >= 0 &&
            nextPos < this.size &&
            (this.getPieceType(nextPos) === 'Empty' || this.isOpponent(from, nextPos))
          ) {
            optionalMoves.push(nextPos);
          }
        }
        if (!piece.hasMoved && !piece.hasChecked) {
          if (
            this.getPieceType(from - 1) === 'Empty' &&
            this.getPieceType(from - 2) === 'Empty' &&
            this.getPieceType(from - 3) === 'Empty' &&
            this.getPieceType(from - 4) === 'Rook' &&
            this.board[from - 4].hasMoved === false
          ) {
            optionalMoves.push(from - 2);
          }
          if (
            this.getPieceType(from + 1) === 'Empty' &&
            this.getPieceType(from + 2) === 'Empty' &&
            this.getPieceType(from + 3) === 'Rook' &&
            this.board[from + 3].hasMoved === false
          ) {
            optionalMoves.push(from + 2);
          }
        }
        return optionalMoves;
      }
      case 'Knight': {
        let diffs = [15, 17, 6, 10, -15, -17, -6, -10];
        let crossDiffs = [
          [8, 7],
          [8, 9],
          [-1, 7],
          [1, 9],
          [-8, -7],
          [-8, -9],
          [1, -7],
          [-1, -9],
        ];
        let optionalMoves = [];
        for (let index = 0; index < 8; index++) {
          let diff = diffs[index];
          let crossDiff = crossDiffs[index];
          let nextPos = from + diff;
          if (!this.isInKnight(from, nextPos)) continue;
          if (
            nextPos >= 0 &&
            nextPos < this.size &&
            (this.getPieceType(nextPos) === 'Empty' || this.isOpponent(from, nextPos)) &&
            (this.getPieceType(from + crossDiff[0]) != 'Fear' || this.getPieceType(from + crossDiff[1]) != 'Fear')
          ) {
            optionalMoves.push(nextPos);
          }
        }
        return optionalMoves;
      }
    }
  }

  getAllAvailableMoves() {
    let availableMoves = new Array(this.size).fill([]);
    for (let i = 0; i < this.size; i++) {
      if (this.board[i].colour == matchedColour[this.turn]) {
        availableMoves[i] = this.getAvailableMoves(i);
      }
    }
    return availableMoves;
  }
  print() {
    for (let i = 7; i >= 0; i--) {
      let outputString = '';
      for (let j = 0; j < 8; j++) {
        let index = i * 8 + j;
        let abbreviatedString = this.board[index].name.split('-').map((substr) => substr[0]);
        outputString += abbreviatedString + ' ';
      }
      console.log(outputString);
    }
  }
}

module.exports = {
  ChessBoard,
};
