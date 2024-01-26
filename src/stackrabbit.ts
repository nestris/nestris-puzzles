import { GameState } from "./tetris-models/game-state";
import MoveableTetromino from "./tetris-models/moveable-tetromino";
import { TetrisBoard } from "./tetris-models/tetris-board";
import { TetrominoType } from "./tetris-models/tetromino-type";

const cModule = require("../cpp/cRabbit");

const NUM_PLAYOUTS = 200;
const PLAYOUT_DEPTH = 6;

// returns raw JSON of Stackrabbit top moves given board, current piece, and next piece
// it gives top 5 NNB moves, and top 5 NB moves
export function getRawStackrabbitMoves(state: GameState) {

    const boardString = state.getBoard().toBinaryString();

    const level = 18; // puzzles are always at level 18
    const lines = 0; // puzzles are always at 0 lines
    const inputFrameTimeline = "X."; // puzzles are always at 30hz

    const result = cModule.getTopMovesHybrid(
        `${boardString}|${level}|${lines}|${state.getCurrentPiece()}|${state.getNextPiece()}|${inputFrameTimeline}|${NUM_PLAYOUTS}|${PLAYOUT_DEPTH}|`
    );
    return JSON.parse(result);

}

export interface StackrabbitMove {

    firstPlacement: MoveableTetromino;
    secondPlacement: MoveableTetromino;
    score: number;

}

export function getStackrabbitMoves(state: GameState): StackrabbitMove[] {

    // run stackrabbit and get raw JSON
    const response = getRawStackrabbitMoves(state);

    // parse JSON into StackrabbitMove[]
    const moves: StackrabbitMove[] = [];
    response["nextBox"].forEach((move: any) => {

        const firstPlacement = MoveableTetromino.fromStackRabbitPose(
            state.getCurrentPiece(),
            move["firstPlacement"][0],
            move["firstPlacement"][1],
            move["firstPlacement"][2]
        );

        const secondPlacement = MoveableTetromino.fromStackRabbitPose(
            state.getNextPiece(),
            move["secondPlacement"][0],
            move["secondPlacement"][1],
            move["secondPlacement"][2]
        );

        moves.push({
            firstPlacement: firstPlacement,
            secondPlacement: secondPlacement,
            score: move["playoutScore"]
        });
    });

    return moves;
    
}