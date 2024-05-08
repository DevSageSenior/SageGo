const Board = require('../src/GoBoard');

const edges = [
  [1, 5, 9],
  [0, 2, 8],
  [1, 3, 12],
  [2, 4, 15],
  [3, 5, 18],
  [4, 0, 19],
  [7, 9, 27],
  [6, 8, 26],
  [7, 1, 10],
  [0, 6, 22],
  [8, 11, 29],
  [10, 12, 34],
  [11, 2, 13],
  [12, 14, 36],
  [13, 15, 39],
  [14, 3, 16],
  [15, 17, 41],
  [16, 18, 44],
  [17, 4, 20],
  [5, 21, 23],
  [18, 21, 46],
  [20, 19, 47],
  [9, 23, 31],
  [19, 22, 50],
  [25, 27],
  [24, 26],
  [25, 7, 28],
  [6, 24, 30],
  [26, 29],
  [28, 10, 32],
  [27, 31],
  [22, 30, 52],
  [29, 33],
  [32, 34],
  [33, 11, 35],
  [34, 36],
  [35, 13, 37],
  [36, 38],
  [37, 39],
  [38, 14, 40],
  [39, 41],
  [40, 16, 42],
  [41, 43],
  [42, 44],
  [43, 17, 45],
  [44, 46],
  [45, 20, 48],
  [21, 49, 51],
  [46, 49],
  [48, 47],
  [23, 51, 53],
  [47, 50],
  [31, 53],
  [50, 52],
];
const signMap = [
  -1, 0, -1, 0, 0, 1, -1, 0, -1, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
];

let board = new Board(signMap.length, edges);
board.signMap = [...signMap];

for (let i = 0; i < board.size; i++) {
  let predictState = board.isValidMove(-1, i);
  if (predictState.isValid == false) {
  } else {
    let nextBoard = board.makeMove(-1, i);
    for (let j = 0; j < board.size; j++) {
      let predictState = nextBoard.isValidMove(1, j);
      if (predictState.isValid == false && predictState.ErrorMessage == 'Ko') {
      }
    }
  }
}
exports.HexBoard = board;
