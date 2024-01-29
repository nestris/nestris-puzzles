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

const allPlayoutSettings: PlayoutSettings[] = [
    {depth: 6, playouts: 200},
    {depth: 4, playouts: 200},
    {depth: 2, playouts: 100},
    {depth: 1, playouts: 100},
];

// should ultimately return Promise<puzzle | undefined>
export async function evaluatePuzzle(state: BoardState): Promise<any> {

    const evals = allPlayoutSettings.map((settings) => {
        return getStackrabbitMoves(state, settings.depth, settings.playouts);
    });

    const bestMove = evals[0].nb[0].firstPlacement;
    const diffs = evals.map((response) => {
        return getEvalDiff(response, bestMove);
    });

    const depthDiffPairs: [number, number][] = [];
    for (let i = 0; i < diffs.length; i++) {
        let diff = diffs[i] ?? -20;
        depthDiffPairs.push([allPlayoutSettings[i].depth, diff]);
    }

    const bestFit = regression.linear(depthDiffPairs);

    const response: any[] = [];

    for (let i = 0; i < diffs.length; i++) {
        response.push({
            depth: allPlayoutSettings[i].depth,
            playouts: allPlayoutSettings[i].playouts,
            diff: diffs[i],
            moves: condenseResponse(evals[i])
        });
    }

    return {
        bestMove: bestMove.getTetrisNotation(),
        equation: bestFit.equation,
        equationString: bestFit.string,
        response: response
    }
}

function condenseResponse(response: StackrabbitResponse) {
    const result: any = {};
    return response.nb.map((move) => {
        return {
            placement: move.firstPlacement.getTetrisNotation(),
            score: move.score
        }
    });
}