import { GameState } from "./tetris-models/game-state";
import { TetrisBoard } from "./tetris-models/tetris-board";
import { TetrominoType } from "./tetris-models/tetromino-type";

const cModule = require("../cpp/cRabbit");

const NUM_PLAYOUTS = 200;
const PLAYOUT_DEPTH = 6;

export function getStackrabbitMoves(state: GameState) {

    const boardString = state.getBoard().toBinaryString();

    const level = 18; // puzzles are always at level 18
    const lines = 0; // puzzles are always at 0 lines
    const inputFrameTimeline = "X."; // puzzles are always at 30hz

    const result = cModule.getTopMoves(
        `${boardString}|${level}|${lines}|${state.getCurrentPiece()}|${state.getNextPiece()}|${inputFrameTimeline}|${NUM_PLAYOUTS}|${PLAYOUT_DEPTH}|`
    );
    return result;
}