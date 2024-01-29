import { StackrabbitMove, StackrabbitResponse, getStackrabbitMoves } from "../stackrabbit";
import MoveableTetromino from "../tetris-models/moveable-tetromino";
import { BoardState, Puzzle } from "./puzzle-models";
import regression from 'regression';

// Find the matching placement in the response
// if the placement is best move, return positive difference between best and second best
// if placement is not best move, return negative difference between best and the placement
// if placement is not in response, return undefined
function getEvalDiff(response: StackrabbitResponse, placement: MoveableTetromino): number {
        
    let moves = response.nb;
    if (moves.length === 0) throw new Error("No moves in response");

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
    return -100;
}

export interface PlayoutSettings {
    depth: number;
    playouts: number;
}

const highDepth: PlayoutSettings = {depth: 6, playouts: 200};
const lowDepth: PlayoutSettings = {depth: 1, playouts: 100};

export interface PuzzleEvaluation {
    bestFirstPlacement: MoveableTetromino;
    bestSecondPlacement: MoveableTetromino;
    bestMoveEval: number; // eval for the best move
    deepDiff: number;
    deepMoves: StackrabbitMove[];
    shallowDiff: number;
    shallowMoves: StackrabbitMove[];
}

/*
Given a board, current, and next piece, evaluate with low and high
depth StackRabbit and calculate diffs to help determine difficulty
*/
export function evaluatePuzzle(state: BoardState): PuzzleEvaluation {

    const deepEval = getStackrabbitMoves(state, highDepth);
    const shallowEval = getStackrabbitMoves(state, lowDepth);

    const bestMove = deepEval.nb[0];

    const deepDiff = getEvalDiff(deepEval, bestMove.firstPlacement);
    const shallowDiff = getEvalDiff(shallowEval, bestMove.firstPlacement);

    console.log("first", bestMove.firstPlacement.getTetrisNotation());
    console.log("second", bestMove.secondPlacement!.getTetrisNotation());

    return {
        bestFirstPlacement: bestMove.firstPlacement,
        bestSecondPlacement: bestMove.secondPlacement!,
        bestMoveEval: bestMove.score,
        deepDiff: deepDiff,
        deepMoves: deepEval.nb,
        shallowDiff: shallowDiff,
        shallowMoves: shallowEval.nb
    }
}

// convert the diff from shallow depth to elo
// https://www.desmos.com/calculator/5ty0wg93j3
function shallowDiffToElo(shallowDiff: number): number {
    return Math.floor(500 * Math.atan(-shallowDiff / 10) + 1500);
}


// Return with the puzzle difficulty elo, or undefined if the puzzle is not good
export function ratePuzzleDifficulty(evaluation: PuzzleEvaluation): number | undefined {

    // if the overall eval of the board is too low, discard
    if (evaluation.bestMoveEval < -100) return undefined;

    // if the top two moves are too similar in eval, discard
    if (evaluation.deepDiff < 5) return undefined;

    return shallowDiffToElo(evaluation.shallowDiff);
}

export function getPuzzleEvaluationJSON(evaluation: PuzzleEvaluation): any {
    return {
        elo: ratePuzzleDifficulty(evaluation),
        bestFirstPlacement: evaluation.bestFirstPlacement.getTetrisNotation(),
        bestSecondPlacement: evaluation.bestSecondPlacement.getTetrisNotation(),
        deep: {
            diff: evaluation.deepDiff,
            moves: getMovesJSON(evaluation.deepMoves)
        },
        shallow: {
            diff: evaluation.shallowDiff,
            moves: getMovesJSON(evaluation.shallowMoves)
        }
    }
}

function getMovesJSON(moves: StackrabbitMove[]) {
    return moves.map((move) => {
        return {
            firstPlacement: move.firstPlacement.getTetrisNotation(),
            secondPlacement: move.secondPlacement?.getTetrisNotation(),
            score: move.score
        }
    });
}