import { TetrisBoard } from "../tetris-models/tetris-board";
import { ColorType } from "../tetris-models/tetromino-colors";
import { getRandomTetrominoType } from "../tetris-models/tetromino-type";
import { BoardState } from "../puzzle-models";

export function getFixedBoard(): TetrisBoard {
    const row = "0000000000";
    let string = "";

    for (let y = 0; y < 15; y++) {
        string += row;
    }
    string += "1110000000";
    string += "1111000010";
    string += "1111111110";
    string += "1111111110";
    string += "1111111110";

    return TetrisBoard.fromBinaryString(string);

}

export function getRandomBoard() {

    const board = new TetrisBoard();

    // random number from 5 to 15
    let height = Math.floor(Math.random() * 11) + 5;

    for (let x = 0; x < 9; x++) {
        for (let y = 0; y < height; y++) {
            board.setAt(x, 19-y, ColorType.WHITE);
        }

        // delta is random number from 2 to -4
        let delta = Math.floor(Math.random() * 7) - 4;
        if (Math.random() < 0.4) delta = 0; // 50% chance of no change

        height += delta;

        // clamp height between 16 and 0
        
        height = Math.max(height, 0);
        height = Math.min(height, 16);        
    }

    return board;

}

export function getRandomBoardState(): BoardState {

    
    const board = getRandomBoard();
    const currentType = getRandomTetrominoType();
    const nextType = getRandomTetrominoType();

    return {
        board,
        currentType,
        nextType,
    }
}