import { PlayoutSettings } from "./puzzle-generation/evaluate-puzzle";
import { BoardState } from "./puzzle-generation/puzzle-models";
import MoveableTetromino from "./tetris-models/moveable-tetromino";
import { TetrominoType } from "./tetris-models/tetromino-type";

const cModule = require("../cpp/cRabbit");

// returns raw JSON of Stackrabbit top moves given board, current piece, and next piece
// it gives top 5 NNB moves, and top 5 NB moves
export function getRawStackrabbitMoves(state: BoardState, depth: number = 6, playouts: number = 200) {

    const boardString = state.board.toBinaryString();

    const level = 18; // puzzles are always at level 18
    const lines = 0; // puzzles are always at 0 lines
    const inputFrameTimeline = "X."; // puzzles are always at 30hz

    const result = cModule.getTopMovesHybrid(
        `${boardString}|${level}|${lines}|${state.currentType}|${state.nextType}|${inputFrameTimeline}|${playouts}|${depth}|`
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

export function getStackrabbitMoves(state: BoardState, playoutSettings: PlayoutSettings = {
    depth: 6,
    playouts: 200
}): StackrabbitResponse {

    // run stackrabbit and get raw JSON
    console.time(`Stackrabbit ${playoutSettings.depth} ${playoutSettings.playouts}`);
    const response = getRawStackrabbitMoves(state, playoutSettings.depth, playoutSettings.playouts);
    console.timeEnd(`Stackrabbit ${playoutSettings.depth} ${playoutSettings.playouts}`);

    return {
        nnb: parseStackrabbitMovelist(response["noNextBox"], state.currentType, undefined),
        nb: parseStackrabbitMovelist(response["nextBox"], state.currentType, state.nextType)
    }
}