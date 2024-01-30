import { addPuzzleToDatabase, batchAddPuzzlesToDatabase } from "../database/puzzle/puzzle-service";
import { PuzzleEvaluation, evaluatePuzzle, ratePuzzleDifficulty } from "./evaluate-puzzle";
import { getRandomBoardState } from "./generate-random-puzzle";
import { BoardState, Puzzle } from "../puzzle-models";

export function generatePuzzle(): Puzzle | undefined {

    const MAX_ATTEMPTS = 20;

    // keep generating puzzles until we get one that is rated
    let state: BoardState | undefined = undefined;
    let puzzleEval: PuzzleEvaluation | undefined = undefined;
    let elo: number | undefined = undefined;
    for (let i = 0; i < MAX_ATTEMPTS; i++){
        state = getRandomBoardState();
        puzzleEval = evaluatePuzzle(state);
        elo = ratePuzzleDifficulty(puzzleEval);
        if (elo !== undefined) break;
    }

    // failed to generate a puzzle
    if (elo === undefined || state === undefined || puzzleEval === undefined) return undefined;

    // now, we have a puzzle that is rated
    const puzzle: Puzzle = {
        board: state.board,
        currentType: state.currentType,
        nextType: state.nextType,
        elo: elo,
        attempts: 0,
        successes: 0,
        correctSolution: puzzleEval.correctSolution,
        incorrectSolutions: puzzleEval.incorrectSolutions,
    };
    
    return puzzle;
}

// generate and add the specified number of puzzles to the database
// returns a list of puzzle IDs
export async function generateAndAddPuzzlesToDatabase(numPuzzles: number = 1) {

    console.time(`Generate ${numPuzzles} Puzzles`);

    const puzzles: Puzzle[] = [];

    for (let i = 0; i < numPuzzles; i++) {
        const puzzle = generatePuzzle();
        if (puzzle !== undefined) puzzles.push(puzzle);
    }

    console.timeEnd(`Generate ${numPuzzles} Puzzles`);

    console.time("Add Puzzles to Database");
    const puzzleIDs = await batchAddPuzzlesToDatabase(puzzles);
    console.timeEnd("Add Puzzles to Database");

    return puzzleIDs;
}