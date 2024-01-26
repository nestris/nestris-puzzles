import { TetrisBoard } from "./tetris-board";
import { TetrominoType } from "./tetromino-type";

export class GameState {

    constructor(
        private board: TetrisBoard,
        private currentPiece: TetrominoType,
        private nextPiece: TetrominoType
    ) {}

    getBoard(): TetrisBoard {
        return this.board;
    }

    getCurrentPiece(): TetrominoType {
        return this.currentPiece;
    }

    getNextPiece(): TetrominoType {
        return this.nextPiece;
    }

}