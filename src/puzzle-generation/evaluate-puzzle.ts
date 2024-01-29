import { StackrabbitMove, StackrabbitResponse, getStackrabbitMoves } from "../stackrabbit";
import MoveableTetromino from "../tetris-models/moveable-tetromino";
import { BoardState, Puzzle } from "./puzzle-models";
import regression from 'regression';

// Find the matching placement in the response
// if the placement is best move, return positive difference between best and second best
// if placement is not best move, return negative difference between best and the placement
// if placement is not in response, return undefined
function getEvalDiff(response: StackrabbitResponse, placement: MoveableTetromino): number | undefined {
        
    let moves = response.nb;
    if (moves.length === 0) return undefined;

    if (moves[0].firstPlacement.equals(placement)) {
        console.log("BEST MOVE");
        return moves[0].score - moves[1].score;
    }

    for (let i = 1; i < moves.length; i++) {
        if (moves[i].firstPlacement.equals(placement)) {
            console.log("MATCHING MOVE", i);
            return moves[i].score - moves[0].score;
        }
    }

    console.log("NO MATCH");
    return undefined;
}

/*
Given a board, current, and next piece, determine whether it
constitutes a good puzzle. if so, return with correct/incorrect solutions,
as well as the elo of the puzzle
*/

export interface PlayoutSettings {
    depth: number;
    playouts: number;
}


const highDepth: PlayoutSettings = {depth: 6, playouts: 200};
const lowDepth: PlayoutSettings = {depth: 1, playouts: 100};

// should ultimately return Promise<puzzle | undefined>
export async function evaluatePuzzle(state: BoardState): Promise<any> {

    const deepEval = getStackrabbitMoves(state, highDepth);
    const shallowEval = getStackrabbitMoves(state, lowDepth);

    const bestMove = deepEval.nb[0].firstPlacement;
    const deepDiff = getEvalDiff(deepEval, bestMove);
    const shallowDiff = getEvalDiff(shallowEval, bestMove);

    console.log("first", bestMove.getTetrisNotation());
    console.log("second", deepEval.nb[0].secondPlacement?.getTetrisNotation());

    return {
        bestMove: bestMove.getTetrisNotation(),
        deep: {
            diff: deepDiff,
            placements: condenseResponse(deepEval)
        },
        shallow: {
            diff: shallowDiff,
            placements: condenseResponse(shallowEval)
        }
    }
}

function condenseResponse(response: StackrabbitResponse) {
    const result: any = {};
    return response.nb.map((move) => {
        return {
            firstPlacement: move.firstPlacement.getTetrisNotation(),
            secondPlacement: move.secondPlacement?.getTetrisNotation(),
            score: move.score
        }
    });
}