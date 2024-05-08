const {board} = require('./SquareData')
const Board = require('../src/GoBoard');
const mongoose = require('mongoose');
const setupTestDB = require('../../../../tests/utils/setupTestDB');
const {HexBoard} = require('./HexData')

setupTestDB()

describe('Go Square Board', () => {
    describe('constructor test', () => {
        let size = 19 * 19;
        let edges = [[]];
        let goBoard = new Board(size, edges);
        test('should size is equal to the length of the board data', () => {
            expect(goBoard.signMap.length).toEqual(size);
        })
        test('should return no captures when initializing the board', () => {
            expect(goBoard._captures).toEqual([0, 0]);
        })
        test('should be no ko detection when initializing the board', () => {
            expect(goBoard._koInfo.sign).toEqual(0);
        })
        test('there should be only two players', () => {
            expect(goBoard._players.length).toBe(2);
        })
    })
    describe('basic API test', () => {
        let goBoard = board;
        test('should return false when to try to get the sign outside of the board', () => {
            expect(goBoard.get(-1)).toEqual(undefined)
            expect(goBoard.get(goBoard.size)).toEqual(undefined)
            expect(goBoard.get(10203)).toEqual(undefined)
        })
        test('should return exact sign when to try to get the sign inside', () => {
            expect(goBoard.get(1)).toEqual(goBoard.signMap[1])
            expect(goBoard.get(0)).toEqual(goBoard.signMap[0])
            expect(goBoard.get(goBoard.size - 1))
            .toEqual(goBoard.signMap[goBoard.size - 1])
        })
        test('should change the sign if the point is inside', () => {
            expect(goBoard.set(0, -1).get(0)).toBe(-1)
            expect(goBoard.set(goBoard.size - 1, 1).get(goBoard.size - 1)).toBe(1)
            goBoard.set(0, 0)
            goBoard.set(goBoard.size - 1, 0)
        })
        test('should not change the sign if the point is outside', () => {
            expect(goBoard.set(-1, -1).get(0)).toBe(goBoard.get(0))
            expect(goBoard.set(goBoard.size, 1).get(goBoard.size - 1))
            .toBe(goBoard.get(goBoard.size - 1))
        })
        test('should detect whether the point is inside or outside', () => {
            expect(goBoard.has(-1)).toBe(false)
            expect(goBoard.has(goBoard.size)).toBe(false);
            expect(goBoard.has(0)).toBe(true)
            expect(goBoard.has(goBoard.size - 1)).toBe(true)
        })

    })
    describe('controlling relation test', () => {
        let goBoard = board;
        test('should get exact neighbors of the point', () => {
            let neighbors = goBoard.getNeighbors(0).sort()
            expect(neighbors).toEqual([1, 19]);
            neighbors = goBoard.getNeighbors(14).sort();
            expect(neighbors).toEqual([13, 15, 33]);
        })
        test('should get exact chain of the point', () => {
            let chain = goBoard.getChain(1).sort(((l_, r_) => Number(l_) - Number(r_)));
            expect(chain).toEqual([
                0,  1,   2,  19,  20,  38,  39,  57,  58,
               59,  60,  76,  77,  78,  79,  95,  96,
               98,  99, 114, 115, 116, 133, 134, 152,
              153, 171, 172
            ])
        })
    })
    describe('logic test', () => {
        
        let goBoard = board;
        test('should detect overwrite stone', () => {
            let state = goBoard.isValidMove(-1, 1);
            expect(state).toEqual({
                isValid : true,
                ErrorMessage : ''
            })
            state = goBoard.isValidMove(-1, 4);
            expect(state).toEqual({
                isValid : false,
                ErrorMessage : 'Overwrite'
            })
        })
        test('should detect suicide', () => {
            let state = goBoard.isValidMove(-1, 7);
            let SuicideState = {
                isValid : false,
                ErrorMessage : 'Suicide'
            }
            let SuccessState = {
                isValid : true,
                ErrorMessage : ''
            }
            expect(state).toEqual(SuicideState)
            expect(goBoard.isValidMove(-1, 54)).toEqual(SuicideState)
            expect(goBoard.isValidMove(-1, 1)).toEqual(SuccessState)
        })
        test('should detect ko', () => {
            let KoState = {
                isValid : false,
                ErrorMessage : 'Ko'
            }
            let SuccessState = {
                isValid : true,
                ErrorMessage : '',
            }
            let newBoard = goBoard.makeMove(-1, 360)
            expect(newBoard.isValidMove(1, 341)).toEqual(KoState)

            expect(newBoard.isValidMove(1, 1)).toEqual(SuccessState)
        })
    })
    describe('move test', () => {
        let goBoard = board
        test('should return true if its chain has Liberties', () => {
            expect(goBoard.hasLiberties(4)).toEqual(true);
            expect(goBoard.hasLiberties(0)).toEqual(false);
            expect(goBoard.hasLiberties(35)).toEqual(true);
        })
    })
})

describe('Go Hex Board', () => {
    describe('constructor test', () => {
        let size = 19 * 19;
        let edges = [[]];
        let goBoard = new Board(size, edges);
        test('should size is equal to the length of the board data', () => {
            expect(goBoard.signMap.length).toEqual(size);
        })
        test('should return no captures when initializing the board', () => {
            expect(goBoard._captures).toEqual([0, 0]);
        })
        test('should be no ko detection when initializing the board', () => {
            expect(goBoard._koInfo.sign).toEqual(0);
        })
        test('there should be only two players', () => {
            expect(goBoard._players.length).toBe(2);
        })
    })
    describe('basic API test', () => {
        let goBoard = HexBoard;
        test('should return false when to try to get the sign outside of the board', () => {
            expect(goBoard.get(-1)).toEqual(undefined)
            expect(goBoard.get(goBoard.size)).toEqual(undefined)
            expect(goBoard.get(10203)).toEqual(undefined)
        })
        test('should return exact sign when to try to get the sign inside', () => {
            expect(goBoard.get(1)).toEqual(goBoard.signMap[1])
            expect(goBoard.get(0)).toEqual(goBoard.signMap[0])
            expect(goBoard.get(goBoard.size - 1))
            .toEqual(goBoard.signMap[goBoard.size - 1])
        })
        test('should change the sign if the point is inside', () => {
            expect(goBoard.set(0, -1).get(0)).toBe(-1)
            expect(goBoard.set(goBoard.size - 1, 1).get(goBoard.size - 1)).toBe(1)
            goBoard.set(0, 0)
            goBoard.set(goBoard.size - 1, 0)
        })
        test('should not change the sign if the point is outside', () => {
            expect(goBoard.set(-1, -1).get(0)).toBe(goBoard.get(0))
            expect(goBoard.set(goBoard.size, 1).get(goBoard.size - 1))
            .toBe(goBoard.get(goBoard.size - 1))
        })
        test('should detect whether the point is inside or outside', () => {
            expect(goBoard.has(-1)).toBe(false)
            expect(goBoard.has(goBoard.size)).toBe(false);
            expect(goBoard.has(0)).toBe(true)
            expect(goBoard.has(goBoard.size - 1)).toBe(true)
        })

    })
    describe('controlling relation test', () => {
        let goBoard = HexBoard;
        test('should get exact neighbors of the point', () => {
            let neighbors = goBoard.getNeighbors(20).sort()
            expect(neighbors).toEqual([18, 21, 46]);
            neighbors = goBoard.getNeighbors(14).sort();
            expect(neighbors).toEqual([13, 15, 39]);
        })
        test('should get exact chain of the point', () => {
            let chain = goBoard.getChain(9).sort(((l_, r_) => Number(l_) - Number(r_)));
            expect(chain).toEqual([
                9, 22
            ])
            expect(goBoard.getChain(7).sort((_lv, _rv) => Number(_lv) - Number(_rv)))
            .toEqual([
                3,  4,  7, 10, 11, 12, 14, 15, 16, 17, 18,
               19, 20, 21, 23, 24, 25, 26, 27, 28, 29, 30,
               31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41,
               42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52,
               53
             ])
        })
    })
    describe('logic test', () => {
        
        let goBoard = HexBoard;
        test('should detect overwrite stone', () => {
            let state = goBoard.isValidMove(-1, 1);
            expect(state).toEqual({
                isValid : true,
                ErrorMessage : ''
            })
            state = goBoard.isValidMove(-1, 22);
            expect(state).toEqual({
                isValid : false,
                ErrorMessage : 'Overwrite'
            })
        })
        test('should detect ko', () => {
            let KoState = {
                isValid : false,
                ErrorMessage : 'Ko'
            }
            let SuccessState = {
                isValid : true,
                ErrorMessage : '',
            }
            let newBoard = goBoard.makeMove(-1, 360)  
            expect(newBoard.isValidMove(1, 341)).toEqual(KoState)

            expect(newBoard.isValidMove(1, 1)).toEqual(SuccessState)
        })
    })
    describe('move test', () => {
        let goBoard = HexBoard
        test('should return true if its chain has Liberties', () => {
            expect(goBoard.hasLiberties(4)).toEqual(false);
            expect(goBoard.hasLiberties(8)).toEqual(true);
            expect(goBoard.hasLiberties(15)).toEqual(false);
        })
    })
})