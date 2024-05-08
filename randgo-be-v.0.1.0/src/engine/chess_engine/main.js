const { ChessBoard } = require('./ChessBoard');

const board = new ChessBoard();

let history = `1. e4 e6 2. d4 d5 3. Nc3 Nf6 4. e5 Nfd7 5. f4 c5 6. Nf3 Nc6 7. Be3 Be7 8. 
Qd2 a6 9. a3 b5 10. Bd3 Bb7 11. O-O O-O 12. Kh1 f5 13. Qf2 Rc8 14. Rg1 b4 
15. axb4 Nxb4 16. g4 g6 17. gxf5 Nxd3 18. cxd3 Rxf5 19. Ne2 Rf7 20. h4 Kh8
21. h5 gxh5 22. Qh2 Qf8 23. Qxh5 c4 24. Ng5 Bxg5 25. Rxg5 cxd3 26. Nc3 Nb6
27. f5 Rxf5 28. Rxf5 Qxf5 29. Bg5 Rf8 30. Qh4 Qf3+ 31. Kg1 Nd7 32. Kh2 
Qf2+ 33. Qxf2 Rxf2+ 34. Kg3 Rxb2 35. Rf1 Kg7 36. Na4 Rc2 37. Bf6+ Kg6 38. 
Kf4 Nxf6 39. exf6 d2 40. f7 Rc1 0-1`;

let splitedString = history.split(/[\s\n]+/);
let moves = splitedString.filter((value, index) => index % 3 && index != splitedString.length - 1);
function parseMove(moveString) {
  // Regular expression to match algebraic notation move
  var moveRegex = /^([NBRQK]?)([a-h]?)([1-8]?)([x:]?)([a-h])([1-8])(=[NBRQK]?)?(\+|\#)?$/;

  // Executing regex to extract move details
  var match = moveString.match(moveRegex);

  var move = {};
  if (match)
    move = {
      piece: match[1] || '', // Piece (N, B, R, Q, K)
      fromFile: match[2] || '', // From file (a-h)
      fromRank: match[3] || '', // From rank (1-8)
      capture: match[4] === 'x', // Capture indicator (true/false)
      toFile: match[5], // To file (a-h)
      toRank: match[6], // To rank (1-8)
      promotion: match[7] || '', // Promotion piece (N, B, R, Q, K)
      check: match[8] === '+' || match[8] === '#' ? match[8] : '', // Check indicator (+ or #)
    };

  // Handle castle moves
  if (moveString === 'O-O' || moveString === 'O-O-O') {
    move.castle = true;
  } else {
    move.castle = false;
  }

  // Handle passing the turn
  if (moveString === '-' || moveString === ':') {
    move.pass = true;
  } else {
    move.pass = false;
  }

  // Handle pawn moves without 'piece' specified
  if (!move.piece) {
    move.piece = 'P'; // Pawn
  }

  return move;
}

const getIndex = (file, rank) => {
  return file.charCodeAt(0) - 97 + (rank - '1') * 8;
};

const pieceType = {
  P: 'Pawn',
  N: 'Knight',
  B: 'Bishop',
  R: 'Rook',
  Q: 'Queen',
  K: 'King',
};

for (let move of moves) {
  let parsedMove = parseMove(move);
  if (!parsedMove.pass) {
    if (parsedMove.castle) {
      let from, to;
      const matchedColour = ['white', 'black'];
      for (let i = 0; i < board.size; i++) {
        if (board.getPieceType(i) == 'King' && board.board[i].colour == matchedColour[board.turn]) {
          from = i;
          if (move.length > 3) to = from - 2;
          else to = from + 2;
        }
      }
      if (board.isValidMove(from, to) != 'Valid') {
        console.error('Engine validation is not correct');
        break;
      }
      board.makeMove(from, to);
    } else {
      let to = getIndex(parsedMove.toFile, parsedMove.toRank);
      if (parsedMove.fromFile != '') {
        fromDownLimit = (parsedMove.fromFile.charCodeAt(0) - 96) * 8;
        fromUpLimit = fromDownLimit + 7;
      }
      if (parsedMove.fromRank != '') {
        fromUpLimit = fromDownLimit = getIndex(parsedMove.fromFile, parsedMove.fromRank);
      }
      let optionalFroms = board.expectFrom(pieceType[parsedMove.piece], to);
      if (parsedMove.fromFile != '') {
        optionalFroms = optionalFroms.filter((val) => val % 8 == parsedMove.fromFile.charCodeAt(0) - 97);
      }
      if (parsedMove.fromRank != '') {
        optionalFroms = optionalFroms.filter((val) => val == getIndex(parsedMove.fromFile, parsedMove.fromRank));
      }
      optionalFroms = optionalFroms.filter((from) => board.isValidMove(from, to) == 'Valid');
      if (optionalFroms.length != 1) {
        console.error('Engine validation is not correct');
        break;
      }
      let from = optionalFroms[0];
      board.makeMove(from, to);
    }
  } else {
    board.pass();
  }
}

board.print();
