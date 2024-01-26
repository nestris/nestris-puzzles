import { GameState } from "./tetris-models/game-state";
import MoveableTetromino from "./tetris-models/moveable-tetromino";
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
    secondPlacement?: MoveableTetromino;
    score: number;

}

export interface StackrabbitResponse {
    nnb: StackrabbitMove[];
    nb: StackrabbitMove[];
}

function parseStackrabbitMovelist(movelist: any[], currentPiece: TetrominoType, nextPiece?: TetrominoType): StackrabbitMove[] {

    // parse JSON into StackrabbitMove[]
    const moves: StackrabbitMove[] = [];
    movelist.forEach((move: any) => {

        const firstPlacement = MoveableTetromino.fromStackRabbitPose(
            currentPiece,
            move["firstPlacement"][0],
            move["firstPlacement"][1],
            move["firstPlacement"][2]
        );

        let secondPlacement = undefined;
        if (nextPiece) secondPlacement = MoveableTetromino.fromStackRabbitPose(
            nextPiece,
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

export function getStackrabbitMoves(state: GameState): StackrabbitResponse {

    // run stackrabbit and get raw JSON
    const response = getRawStackrabbitMoves(state);

    return {
        nnb: parseStackrabbitMovelist(response["noNextBox"], state.getCurrentPiece(), undefined),
        nb: parseStackrabbitMovelist(response["nextBox"], state.getCurrentPiece(), state.getNextPiece())
    }
    
}