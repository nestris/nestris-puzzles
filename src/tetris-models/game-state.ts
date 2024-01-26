import { StackrabbitResponse, getStackrabbitMoves } from "../stackrabbit";
import MoveableTetromino from "./moveable-tetromino";
import { TetrisBoard } from "./tetris-board";
import { TetrominoType, getRandomTetrominoType } from "./tetromino-type";

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

    // place a piece on the board. Throws an error if the piece is not valid
    placePiece(piece: MoveableTetromino) {

        // make sure piece matches current piece
        if (piece.tetrominoType !== this.currentPiece) {
            throw new Error("Piece does not match current piece");
        }

        // make sure piece placement is legal
        if (!piece.isValidPlacement(this.board)) {
            console.log("attempted to place at");
            piece.print();
            throw new Error("Piece placement is not legal");
        }

        // blit piece to board
        piece.blitToBoard(this.board);

        // update current and next pieces
        this.currentPiece = this.nextPiece;
        this.nextPiece = getRandomTetrominoType();
    }

    // perform StackRabbit analysis to get the top 5 moves.
    // Return the move based off the index
    // if index is 0, return the best move. If index exceeds the number of moves, return the worst move
    makeMove(index: number) {

        const response = getStackrabbitMoves(this);
        const moves = response.nb;

        if (index < 0) index = 0;
        if (index >= moves.length) index = moves.length - 1;
        const move = moves[index];

        this.placePiece(move.firstPlacement);
    }

    print() {
        console.log("Current Piece:", this.currentPiece);
        console.log("Next Piece:", this.nextPiece);
        this.board.print();
    }

}