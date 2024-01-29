import { StackrabbitResponse, getStackrabbitMoves } from "../stackrabbit";
import { BoardState, Puzzle } from "./puzzle-models";

/*
Given a board, current, and next piece, determine whether it
constitutes a good puzzle. if so, return with correct/incorrect solutions,
as well as the elo of the puzzle
*/

// should ultimately return Promise<puzzle | undefined>
export async function evaluatePuzzle(state: BoardState): Promise<any> {

    const deep = await getStackrabbitMoves(state, 6, 200);
    const mid = await getStackrabbitMoves(state, 4, 200);
    const shallow = await getStackrabbitMoves(state, 2, 200);
    const superShallow = await getStackrabbitMoves(state, 1, 200);

    return {
        deep: condenseResponse(deep),
        mid: condenseResponse(mid),
        shallow: condenseResponse(shallow),
        superShallow: condenseResponse(superShallow)
    }
}

function condenseResponse(response: StackrabbitResponse) {
    const result: any = {};
    return response.nnb.map((move) => {
        return {
            placement: move.firstPlacement.getTetrisNotation(),
            score: move.score
        }
    });
}